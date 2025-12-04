from gevent import pywsgi
from gevent.pool import Pool
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello HTTPS!"

if __name__ == "__main__":
    server = pywsgi.WSGIServer(
        ("0.0.0.0", 443),  # HTTPS thường chạy port 443
        app,
        spawn=Pool(2000),
        backlog=2048,
        keyfile="ssl/key.pem",     # private key
        certfile="ssl/cert.pem",   # certificate
    )
    server.serve_forever()
