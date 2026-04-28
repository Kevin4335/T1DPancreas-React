#!/usr/bin/env bash
# Rebuild and (re)start the production backend-service (includes embedded React build
# from backend/Dockerfile.prod). Sends a notification email before and after.
#
# Requirements:
#   - docker-compose (v1) on PATH, or set DOCKER_COMPOSE to the full command
#   - python3; backend/config.py must define CONFIG_EMAIL_USERNAME and
#     CONFIG_EMAIL_PASSWORD (used by backend/my_email.py), same as the running app
#
# Optional environment:
#   NOTIFY_EMAIL   recipient (default: kvchang@umich.edu)
#   COMPOSE_FILE   (default: docker-compose.prod.yml)
#   SERVICE        (default: backend-service)
#   DOCKER_COMPOSE command (default: docker-compose)
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

NOTIFY_EMAIL="${NOTIFY_EMAIL:-kvchang@umich.edu}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
SERVICE="${SERVICE:-backend-service}"
DOCKER_COMPOSE="${DOCKER_COMPOSE:-docker-compose}"

# Best effort: do not abort the deploy if notification email fails
_send_email() {
  local to="$1"
  local subject="$2"
  local body="$3"
  NOTIFY_TO="$to" NOTIFY_SUBJECT="$subject" NOTIFY_BODY="$body" \
    PYTHONPATH="${REPO_ROOT}/backend" python3 - <<'PY' || true
import os, sys, traceback
try:
    from my_email import send_email
    send_email(
        os.environ["NOTIFY_TO"],
        os.environ["NOTIFY_SUBJECT"],
        os.environ["NOTIFY_BODY"],
    )
except Exception as e:
    print("Notification email failed (build continues):", e, file=sys.stderr)
    traceback.print_exc()
PY
}

HOSTNAME_OUT="$(hostname -f 2>/dev/null || hostname || echo unknown)"
START_TS="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"

_send_email "$NOTIFY_EMAIL" \
  "[deploy] ${SERVICE} build STARTED (${HOSTNAME_OUT})" \
"Repository: ${REPO_ROOT}
Compose file: ${COMPOSE_FILE}
Service: ${SERVICE}
Started: ${START_TS}"

BUILD_LOG="$(mktemp)"
trap 'rm -f "${BUILD_LOG}"' EXIT

set +e
# Work around docker-compose v1 KeyError('ContainerConfig') recreate bug:
# remove old service container before up --build.
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" stop "${SERVICE}" >> "${BUILD_LOG}" 2>&1 || true
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" rm -f "${SERVICE}" >> "${BUILD_LOG}" 2>&1 || true
${DOCKER_COMPOSE} -f "${COMPOSE_FILE}" up -d --build "${SERVICE}" 2>&1 | tee -a "${BUILD_LOG}"
STATUS=${PIPESTATUS[0]:-1}
set -e

END_TS="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
TAIL="$(tail -n 60 "${BUILD_LOG}" 2>/dev/null || true)"

if [[ "${STATUS}" -eq 0 ]]; then
  _send_email "$NOTIFY_EMAIL" \
    "[deploy] ${SERVICE} build SUCCEEDED (${HOSTNAME_OUT})" \
"Finished: ${END_TS}
Exit code: 0

---- last 60 log lines ----
${TAIL}"
else
  _send_email "$NOTIFY_EMAIL" \
    "[deploy] ${SERVICE} build FAILED (${HOSTNAME_OUT})" \
"Finished: ${END_TS}
Exit code: ${STATUS}

---- last 60 log lines ----
${TAIL}"
fi

exit "${STATUS}"
