"""
Minimal Flask backend: serve the React frontend, AI chat, and email.

Run: flask --app server_flask run  or  python server_flask.py
"""

from __future__ import annotations

import os
import traceback
from hashlib import sha256
from random import randint
from time import time
from io import BytesIO
from _thread import start_new_thread

from flask import Flask, request, send_file, send_from_directory, Response

from utils import convert_input, R_email_pipe
from my_email import send_email_with_attachment

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS if o.strip()]
if "http://localhost:3000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://localhost:3000")

ENV_MODE = os.environ.get("ENV_MODE", "development")
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
BUILD_DIR = os.getenv("BUILD_DIR") or (
    os.path.join(BACKEND_DIR, "build") if ENV_MODE == "production" else ""
)
BUILD_ROOT = os.path.normpath(BUILD_DIR) if BUILD_DIR else ""

GENERATED_DIR = os.path.join(os.path.dirname(BACKEND_DIR), "tmp")


def _cors_origin():
    origin = request.headers.get("Origin")
    return origin if origin in ALLOWED_ORIGINS else None


def _apply_cors(response: Response) -> Response:
    origin = _cors_origin()
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    return response


# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------

app = Flask(__name__)


@app.after_request
def after_request(response: Response) -> Response:
    return _apply_cors(response)


# -----------------------------------------------------------------------------
# Frontend (production only)
# -----------------------------------------------------------------------------

@app.route("/")
@app.route("/index.html")
def index():
    if ENV_MODE == "production" and BUILD_ROOT and os.path.isdir(BUILD_ROOT):
        path = "index.html"
        full = os.path.join(BUILD_ROOT, path)
        if os.path.isfile(full):
            return send_from_directory(
                BUILD_ROOT, path, mimetype="text/html", max_age=0
            )
    return "404 Not Found", 404


@app.route("/static/<path:path>")
def static_js(path: str):
    if ENV_MODE != "production" or not BUILD_ROOT:
        return "404 Not Found", 404
    full = os.path.join(BUILD_ROOT, "static", path)
    if not os.path.isfile(full):
        return "404 Not Found", 404
    return send_from_directory(
        os.path.join(BUILD_ROOT, "static"), path, max_age=86400
    )


@app.route("/imgs/<path:path>")
def static_imgs(path: str):
    if ENV_MODE != "production" or not BUILD_ROOT:
        return "404 Not Found", 404
    full = os.path.join(BUILD_ROOT, "imgs", path)
    if not os.path.isfile(full):
        return "404 Not Found", 404
    return send_from_directory(
        os.path.join(BUILD_ROOT, "imgs"), path, max_age=86400
    )


# -----------------------------------------------------------------------------
# AI chat
# -----------------------------------------------------------------------------

class _FlaskRequestAdapter:
    """Adapter so ai.process_ai_chat(request, path) works with Flask."""

    def __init__(self, flask_request):
        self.rfile = BytesIO(flask_request.get_data())
        self.headers = flask_request.headers
        self._status = 200
        self._headers_list = []
        self.wfile = BytesIO()

    def send_response(self, code: int) -> None:
        self._status = code

    def send_header(self, key: str, value: str) -> None:
        self._headers_list.append((key, value))

    def end_headers(self) -> None:
        pass

    def flush(self) -> None:
        pass

    def build_response(self) -> Response:
        return Response(
            self.wfile.getvalue(),
            status=self._status,
            headers=dict(self._headers_list),
        )


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return "", 204, {
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    from ai import process_ai_chat
    adapter = _FlaskRequestAdapter(request)
    process_ai_chat(adapter, "/chat")
    return adapter.build_response()


# -----------------------------------------------------------------------------
# Email
# -----------------------------------------------------------------------------

@app.route("/api/email_simple", methods=["POST"])
def api_email_simple():
    try:
        data = request.get_json(force=True, silent=True) or {}
        email = data.get("email")
        image_b64 = data.get("image_data")
        if not email or not image_b64:
            return Response("Missing email or image data.", status=400)
        if len(image_b64) > 10_000_000:
            return Response("Payload too large.", status=413)
        donor = data.get("donor", "")
        condition = data.get("condition", "")
        subject = "Your Multi-Gene FOV Image from COVID-Lung CosMX"
        message = f"Sample: {donor}, Condition: {condition}\n\nAttached is your FOV image."
        send_email_with_attachment(email, subject, message, image_b64)
        print("Email sent successfully.")
        return Response(b"", status=202)
    except Exception as e:
        print("Email send failed:", e)
        traceback.print_exc()
        return Response("Failed to send email.", status=500)


@app.route("/api/email_multi/<path:hex_data>")
def api_email_multi(hex_data: str):
    """Start background job to generate multi-gene FOV image and email it."""
    success, msg, result = convert_input(hex_data)
    if not success:
        print("ERROR:", msg)
        return Response("ERROR: " + msg, status=400, mimetype="text/plain")
    host = request.headers.get("Host", "")
    task_id = sha256(
        f"{result[0]}_{result[1]}_{result[2]}_{result[3]}".encode("utf-8")
    ).hexdigest()
    file_name = sha256(
        f"{task_id}_{randint(0, 100000000000)}_{time()}".encode("utf-8")
    ).hexdigest() + ".pdf"
    start_new_thread(
        R_email_pipe,
        (task_id, file_name, result[0], result[1], result[2], result[3], result[4], host),
    )
    return Response(b"", status=202)


@app.route("/api/generated/<path:filename>")
def api_generated(filename: str):
    """Serve generated image from email_multi pipeline."""
    if ".." in filename:
        return "404 Not Found", 404
    file_path = os.path.join(GENERATED_DIR, filename)
    if not os.path.isfile(file_path):
        return "404 Not Found", 404
    return send_file(file_path, mimetype="image/png")


# -----------------------------------------------------------------------------
# Run
# -----------------------------------------------------------------------------

@app.errorhandler(404)
def handle_404(e):
    return "404 Not Found", 404


def main():
    port = int(os.getenv("PORT", "9035"))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Flask: ENV_MODE={ENV_MODE}, port={port}, build={BUILD_ROOT or 'none'}")
    app.run(host=host, port=port, threaded=True)


if __name__ == "__main__":
    main()
