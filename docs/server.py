#!/usr/bin/env python3

from http.server import SimpleHTTPRequestHandler, HTTPServer

class CustomHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None):
        if code == 404:
            self.path = '/index.html'
            return self.do_GET()
        else:
            super().send_error(code, message)

if __name__ == "__main__":
    PORT = 8000  # You can change this to any port you like
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"Serving on port {PORT}")
    httpd.serve_forever()
