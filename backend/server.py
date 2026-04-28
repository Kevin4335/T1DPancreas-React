from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from _thread import start_new_thread
from time import sleep, time
import json
from myBasics import binToBase64
from mySecrets import hexToStr
import os
import re
from queue import Queue
from R_http import fov_multi, gene_expression
from utils import convert_input, R_email_pipe, CELL_TYPES, GENES_FORMATTED_TO_ORIGIN, binary_to_str, pdf_to_png_bytes
from hashlib import sha256
from random import randint
from datetime import datetime, timezone
from ai import process_ai_chat
from my_email import send_email_with_attachment
import traceback

ALLOWED_ORIGINS = [
    "http://128.84.40.121",
    "http://localhost:3000"
]

IS_SERVER = os.getenv('IS_SERVER', 'false').lower() == 'true'

NO_CACHE = 100000001
CACHE_ALL = 100000002

CACHE_MODE = NO_CACHE
if (IS_SERVER):
    CACHE_MODE = CACHE_ALL
BROWSER_CACHE = False
if (IS_SERVER):
    BROWSER_CACHE = True

USE_BUILT = False

registered = []

ENV_MODE = os.environ.get("ENV_MODE", "development")
BUILD_DIR = ''
print(ENV_MODE)
if ENV_MODE == "production":
    # Base path to React build folder
    BUILD_DIR = os.path.join(os.path.dirname(__file__), 'build')

    # Paths to asset subdirectories
    JS_DIR = os.path.join(BUILD_DIR, 'static', 'js')
    IMG_DIR = os.path.join(BUILD_DIR, 'imgs')

    # List asset files from React build
    jses = os.listdir(JS_DIR) if os.path.isdir(JS_DIR) else []
    imgs = os.listdir(IMG_DIR) if os.path.isdir(IMG_DIR) else []


    # Base directory where React build output lives
    BUILD_ROOT = os.path.join(os.path.dirname(__file__), 'build')

    def access_file(path: str, bin: bool):
        # Normalize and join with build path
        relative_path = path.lstrip('/')  # e.g. 'static/js/main.js'
        full_path = os.path.join(BUILD_ROOT, relative_path)

        if CACHE_MODE == CACHE_ALL and full_path in cached_files:
            data = cached_files[full_path]
        else:
            with open(full_path, 'rb') as f:
                data = f.read()
            if CACHE_MODE == CACHE_ALL:
                cached_files[full_path] = data

        return data if bin else data.decode('utf-8')

    # Register frontend static paths
    for js in jses:
        if js.endswith('.js'):
            registered.append(f'/static/js/{js}')

    for img in imgs:
        if img.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            registered.append(f'/imgs/{img}')



cached_files = {}

T1D_PRECOMPUTED_DIRS = {
    'left': '/mnt/mountpoint/T1D_Cosmx_new/FOV_figs',
    'right': '/mnt/mountpoint/T1D_Cosmx_new/FOV_islet_figs',
}


def donor_subdir_candidates_for_precomputed(donor_key: str):
    # Some datasets use donor folders like ICRH098, others use ICRH_098.
    # Try both to avoid hard-coding one naming convention.
    candidates = [donor_key]
    m = re.match(r'^([A-Za-z]+)(\d+)$', donor_key)
    if m:
        with_underscore = f'{m.group(1)}_{m.group(2)}'
        if with_underscore not in candidates:
            candidates.append(with_underscore)
    return candidates


ROBOTS_TXT ='''
User-agent: *
Disallow: /*
Allow: /html/*
Allow: /index.html
Allow: /$
Allow: /sitemap.xml
Allow: /imgs/*
Allow: /data/*

Sitemap: http://128.84.8.183/sitemap.xml
'''


SITEMAP = '''
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://128.84.8.183/</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/image.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/fov.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/gene.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/enrich.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/dexp.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/help.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://128.84.8.183/html/about.html</loc>
    <lastmod>$lastmod-date$</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
'''

SITEMAP = SITEMAP.replace('$lastmod-date$', datetime.now(timezone.utc).strftime('%Y-%m-%d'))[1:]



class Request(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = self.path.split('?')[0]
    
    # Serve your existing stuff...

    # === Add this for spatial_plots ===
        if path.startswith('/spatial_plots/'):
            local_path = path[len('/spatial_plots/'):]
            
            # Prevent traversal
            if '..' in local_path or local_path.startswith('/'):
                return self.process_404(attack=True)

            # Determine the base directory
            if local_path.startswith('t1d_precomputed/'):
                rest = local_path[len('t1d_precomputed/'):]
                parts = rest.split('/')
                if len(parts) != 4:
                    return self.process_404()
                side, condition, donor_key, fov_token = parts
                if side not in T1D_PRECOMPUTED_DIRS or condition not in ('CTRL', 'T1D'):
                    return self.process_404()
                if not re.match(r'^[A-Z][A-Za-z0-9]+$', donor_key):
                    return self.process_404()
                requested_ext = None
                if fov_token.lower().endswith('.pdf'):
                    requested_ext = 'pdf'
                    fov_s = fov_token[:-4]
                elif fov_token.lower().endswith('.png'):
                    requested_ext = 'png'
                    fov_s = fov_token[:-4]
                else:
                    # Backward compatible default for old URLs without extension.
                    requested_ext = 'pdf'
                    fov_s = fov_token
                try:
                    fov_num = int(fov_s)
                except ValueError:
                    return self.process_404()
                if fov_num < 0 or str(fov_num) != fov_s:
                    return self.process_404()
                base_dir = T1D_PRECOMPUTED_DIRS[side]
                file_path = None
                donor_dirs = donor_subdir_candidates_for_precomputed(donor_key)
                for donor_dir in donor_dirs:
                    subdir = os.path.join(base_dir, condition, donor_dir)
                    for slide_i in range(1, 16):
                        fname = f'{condition}_{donor_key}_Slide_{slide_i}_{fov_num}.pdf'
                        candidate = os.path.join(subdir, fname)
                        if os.path.isfile(candidate):
                            file_path = candidate
                            break
                    if file_path is not None:
                        break
            elif local_path.startswith('all_cells/'):
                base_dir = '/mnt/mountpoint/T1D_Cosmx/figures/spatial_plots/FOV_images_all_cells'
                file_path = os.path.join(base_dir, local_path[len('all_cells/'):])
            elif local_path.startswith('single_gene/'):
                base_dir = '/mnt/mountpoint/T1D_Cosmx/figures/spatial_plots/all_fovs_single_genes'
                file_path = os.path.join(base_dir, local_path[len('single_gene/'):])
            else:
                return self.process_404()

            if file_path is None or not os.path.isfile(file_path):
                return self.process_404()

            try:
                is_precomputed = local_path.startswith('t1d_precomputed/')
                if is_precomputed and requested_ext == 'png':
                    data = pdf_to_png_bytes(file_path)
                    content_type = 'image/png'
                else:
                    with open(file_path, 'rb') as f:
                        data = f.read()
                    if file_path.lower().endswith('.png'):
                        content_type = 'image/png'
                    elif file_path.lower().endswith(('.jpg', '.jpeg')):
                        content_type = 'image/jpeg'
                    elif file_path.lower().endswith('.pdf'):
                        content_type = 'application/pdf'
                    else:
                        content_type = 'application/octet-stream'
                self.send_response(200)
                if content_type == 'application/pdf':
                    self.send_header('Content-Type', 'application/pdf')
                    self.send_header('Content-Disposition', f'inline; filename="{os.path.basename(file_path)}"')
                    self.send_header('X-Content-Type-Options', 'nosniff')
                else:
                    self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', len(data))
                self.send_header('Cache-Control', 'max-age=86400')
                origin = self.headers.get("Origin")
                if origin in ALLOWED_ORIGINS:
                    self.send_header("Access-Control-Allow-Origin", origin)
                self.end_headers()
                self.wfile.write(data)
                self.wfile.flush()
            except Exception as e:
                print(f"Error serving spatial plot image: {e}")
                return self.process_404()
        
        path = self.path.split('?')[0]
        if path in ['/', '/index.html']:
            return self.process_html('/index.html')  # React root
        if path.startswith('/static/') or path.startswith('/imgs/'):
            if ENV_MODE == "production":
                return self.serve_image_from_build(path)
        if path.startswith('/api/'):
            return self.process_get_api(path)
        if path.startswith('/data/'):
            return self.process_server_data(path)
        if path == '/robots.txt':
            return self.process_robots_txt()
        if path == '/sitemap.xml':
            return self.process_sitemap_xml()

        if ENV_MODE == "production":
            return self.process_html('/index.html')
        
        return self.process_404()


    def do_POST(self) -> None:
        path = self.path
        if path == '/api/email_simple':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                email = data.get('email')
                donor = data.get('donor', '')
                condition = data.get('condition', '')
                image_b64 = data.get('image_data')

                if not email or not image_b64:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'Missing email or image data.')
                    return

                # Optional size guard
                if len(image_b64) > 10_000_000:
                    self.send_response(413)
                    self.end_headers()
                    self.wfile.write(b'Payload too large.')
                    return

                subject = "Your Multi-Gene FOV Image from COVID-Lung CosMX"
                message = f"Sample: {donor}, Condition: {condition}\n\nAttached is your FOV image."

                send_email_with_attachment(email, subject, message, image_b64)
                print("Email sent successfully.")

                self.send_response(202)
                origin = self.headers.get("Origin")
                if origin in ALLOWED_ORIGINS:
                    self.send_header("Access-Control-Allow-Origin", origin)
                self.end_headers()
            except Exception as e:
                print("Email send failed:", e)
                traceback.print_exc()
                self.send_response(500)
                origin = self.headers.get("Origin")
                if origin in ALLOWED_ORIGINS:
                    self.send_header("Access-Control-Allow-Origin", origin)
                self.end_headers()
                self.wfile.write(b'Failed to send email.')
            return

        if path == '/chat':
            return process_ai_chat(self, path)

        self.send_response(404)
        self.send_header('Connection', 'keep-alive')
        self.send_header('Content-Length', 13)
        self.end_headers()
        self.wfile.write(b'404 Not Found')
        self.wfile.flush()
        return


    def log_message(self, format, *args):
        pass
    
    def do_OPTIONS(self):
        print('http OPTIONS')
        self.send_response(200)
        self.send_header('Connection', 'keep-alive')
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', 0)
        self.end_headers()
        self.wfile.write(b'')
        self.wfile.flush()
        return
    
    def process_robots_txt(self) -> None:
        self.send_response(200)
        self.send_header('Connection', 'keep-alive')
        self.send_header('Content-Length', len(ROBOTS_TXT.encode('utf-8')))
        self.send_header('Content-Type', 'text/plain')
        self.send_header('Cache-Control', 'max-age=86400')
        self.end_headers()
        self.wfile.write(ROBOTS_TXT.encode('utf-8'))
        self.wfile.flush()
        return
    
    def process_sitemap_xml(self) -> None:
        self.send_response(200)
        self.send_header('Connection', 'keep-alive')
        self.send_header('Content-Length', len(SITEMAP.encode('utf-8')))
        self.send_header('Content-Type', 'application/xml')
        self.send_header('Cache-Control', 'max-age=86400')
        self.end_headers()
        self.wfile.write(SITEMAP.encode('utf-8'))
        self.wfile.flush()
        return
    
    def serve_image_from_build(self, path: str) -> None:
        try:
            full_path = os.path.join(BUILD_DIR, path.lstrip('/'))
            with open(full_path, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'image/jpeg')  # or detect dynamically
            self.send_header('Content-Length', len(data))
            self.send_header('Cache-Control', 'max-age=86400')
            origin = self.headers.get("Origin")
            if origin in ALLOWED_ORIGINS:
                self.send_header("Access-Control-Allow-Origin", origin)
            self.end_headers()
            self.wfile.write(data)
            self.wfile.flush()
        except Exception as e:
            print(f"Error serving image: {e}")
            return self.process_404()
        
    def process_html(self, path: str) -> None:
        if '..' in path:
            return self.process_404(attack=True)

        try:
            html = access_file(path, False)  # no prepending './'
        except:
            return self.process_404()

        if IS_SERVER:
            html = html.replace('<!--$jtc.unique.replacer$', '')
            html = html.replace('$jtc.unique.replacer$-->', '')

        for reg in registered:
            if reg not in html:
                continue
            try:
                file = access_file(reg, True)  # also drop prepended dot
            except:
                continue  # silently skip if file not found
            file = binToBase64(file)
            if reg.endswith('.css'):
                html = html.replace(reg, f'data:text/css;base64,{file}')
            elif reg.endswith('.js'):
                html = html.replace(reg, f'data:application/javascript;base64,{file}')
            elif reg.endswith('.png'):
                html = html.replace(reg, f'data:image/png;base64,{file}')
            elif reg.endswith(('.jpg', '.jpeg')):
                html = html.replace(reg, f'data:image/jpeg;base64,{file}')
            elif reg.endswith('.gif'):
                html = html.replace(reg, f'data:image/gif;base64,{file}')

        html = html.encode('utf-8')
        self.send_response(200)
        self.send_header('Connection', 'keep-alive')
        self.send_header('Content-Type', 'text/html')
        self.send_header('Content-Length', len(html))
        if BROWSER_CACHE:
            self.send_header('Cache-Control', 'max-age=300')
        self.end_headers()
        self.wfile.write(html)
        self.wfile.flush()

    
    def process_server_data(self, path: str) -> None:
        if(IS_SERVER == False):
            return self.process_404()
        if (path.find('..') >= 0):
            return self.process_404(attack=True)
        if('webserver' in path):
            return self.process_404()
        if(path.endswith('.xlsx')):
            return self.process_404()
        if(path.endswith('.R')):
            return self.process_404()
        path = path[6:]
        path = path.replace('@', ' ')
        path = '../' + path
        try:
            data = access_file(path, True)
        except:
            return self.process_404()
        self.send_response(200)
        self.send_header('Connection', 'keep-alive')
        self.send_header('Content-Type', 'image/png')
        self.send_header('Content-Length', len(data))
        if ('slide' in path):
            self.send_header('Cache-Control', f'max-age={3600*24*90}')
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()
        self.wfile.write(data)
        self.wfile.flush()
        return
        
    
    def process_img(self, path: str) -> None:
        return self.process_404(attack=True)
    
    
    def process_404(self, attack=False) -> None:
        self.send_response(404)
        self.send_header('Connection', 'keep-alive')
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()
        self.wfile.write(b'404 Not Found')
        self.wfile.flush()
        return
    
    def process_get_api(self, path: str) -> None:
        path = path[4:]

        
        if (path.startswith('/email_multi/')):
            # print(path)
            success, msg, result = convert_input(path[13:])
            if (success == False):
                msg = "ERROR: \n" + msg
                print(msg)
                msg = msg.encode('utf-8')
                self.send_response(400)
                self.send_header('Connection', 'keep-alive')
                self.send_header('Content-Length', len(msg))
                origin = self.headers.get("Origin")
                if origin in ALLOWED_ORIGINS:
                    self.send_header("Access-Control-Allow-Origin", origin)
                self.end_headers()
                self.wfile.write(msg)
                self.wfile.flush()
                return
            print(result)
            host = self.headers['Host']
            task_id = sha256((f'{result[0]}_{result[1]}_{result[2]}_{result[3]}').encode('utf-8')).hexdigest()
            ran = randint(0, 100000000000)
            file_name = sha256((f'{task_id}_{ran}_{time()}').encode('utf-8')).hexdigest()
            file_name += '.pdf'
            start_new_thread(R_email_pipe, (task_id, file_name, result[0], result[1], result[2], result[3], result[4], host))
            self.send_response(202)
            self.send_header('Connection', 'keep-alive')
            self.send_header('Content-Length', 0)
            origin = self.headers.get("Origin")
            if origin in ALLOWED_ORIGINS:
                self.send_header("Access-Control-Allow-Origin", origin)
            self.end_headers()
            self.wfile.write(b'')
            self.wfile.flush()
            return
        if (path.startswith('/generated/')):
            path = path[11:]
            if ('..' in path):
                return self.process_404(attack=True)
            path = '../tmp/' + path
            try:
                with open(path, 'rb') as f:
                    png = f.read()
            except:
                return self.process_404()
            self.send_response(200)
            self.send_header('Connection', 'keep-alive')
            self.send_header('Content-Type', 'image/png')
            self.send_header('Content-Length', len(png))
            origin = self.headers.get("Origin")
            if origin in ALLOWED_ORIGINS:
                self.send_header("Access-Control-Allow-Origin", origin)
            self.end_headers()
            self.wfile.write(png)
            self.wfile.flush()
            return
        if (path.startswith('/gene_exp/')):
            path = path[10:]
            data = hexToStr(path)
            data = json.loads(data)
            genes = data['genes']
            cell_types = data['cell_types']
            cell_type_names = ''
            cnt_tmp = 0
            for selected in cell_types:
                cnt_tmp += 1
                if (selected):
                    cell_type_names += CELL_TYPES[cnt_tmp - 1] + ','
            assert (cell_type_names != '')
            cell_type_names = cell_type_names[:-1]
            assert (len(genes) > 0)
            my_genes = []
            for g in genes:
                assert (g in GENES_FORMATTED_TO_ORIGIN)
                my_genes.append(GENES_FORMATTED_TO_ORIGIN[g])
            if (len(set(my_genes)) != len(my_genes)):
                self.send_response(500)
                self.send_header('Connection', 'keep-alive')
                origin = self.headers.get("Origin")
                if origin in ALLOWED_ORIGINS:
                    self.send_header("Access-Control-Allow-Origin", origin)
                msg = json.dumps({'msg': "Genes cannot be duplicated!"}, ensure_ascii=False).encode('utf-8')
                self.send_header('Content-Length', len(msg))
                self.end_headers()
                self.wfile.write(msg)
                self.wfile.flush()
                return
            my_genes.sort()
            genes = ','.join(my_genes)
            t = str(time())
            task_id = sha256((f'{genes}_{cell_type_names}_{t}').encode('utf-8')).hexdigest()
            resp = gene_expression(genes, cell_type_names, f'./tmp/{task_id}.pdf')
            if (resp[0] == False):
                self.send_response(500)
                self.send_header('Connection', 'keep-alive')
                origin = self.headers.get("Origin")
                if origin in ALLOWED_ORIGINS:
                    self.send_header("Access-Control-Allow-Origin", origin)
                msg = binary_to_str(resp[1])
                msg = json.dumps({'msg': msg}, ensure_ascii=False).encode('utf-8')
                self.send_header('Content-Length', len(msg))
                self.end_headers()
                self.wfile.write(msg)
                self.wfile.flush()
                return
            file_path = f'../docker/resources/04.exp_functions/tmp/{task_id}.pdf'
            png_bytes = pdf_to_png_bytes(file_path)
            png_base64 = binToBase64(png_bytes)
            data = json.dumps({'img': png_base64}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Connection', 'keep-alive')
            self.send_header('Content-Length', len(data))
            origin = self.headers.get("Origin")
            if origin in ALLOWED_ORIGINS:
                self.send_header("Access-Control-Allow-Origin", origin)
            self.end_headers()
            self.wfile.write(data)
            self.wfile.flush()
            return
        return self.process_404()


pp = 9035
if(IS_SERVER):
    pp = 80
server = ThreadingHTTPServer(('0.0.0.0', pp), Request)
start_new_thread(server.serve_forever, ())
while True:
    sleep(10)