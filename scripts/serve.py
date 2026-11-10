"""Serve the standalone preview with fresh assets during local development."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    port = int(os.environ.get('PORT', '4178'))
    print(f'Local preview: http://127.0.0.1:{port}/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), partial(PreviewHandler, directory=str(root))).serve_forever()
