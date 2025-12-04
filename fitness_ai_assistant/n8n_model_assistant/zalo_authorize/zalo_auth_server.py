from flask import Flask, request

app = Flask(__name__)

@app.route("/zalo/callback")
def zalo_callback():
    code = request.args.get("code")
    if code:
        print(f"\n✅ Nhận được mã xác thực (authorization_code): {code}\n")
        return f"<h3>✅ Đã nhận được mã xác thực!</h3><p>Mã của bạn: {code}</p>"
    else:
        error = request.args.get("error", "Không có mã code.")
        return f"<h3>❌ Lỗi: {error}</h3>"

if __name__ == "__main__":
    app.run(port=5005)
