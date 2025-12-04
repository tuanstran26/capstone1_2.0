import urllib.parse

ZALO_APP_ID = "2741217413358622265"  # Điền App ID bạn lấy ở Zalo Developer
REDIRECT_URI = "https://img-wealth-potential-baby.trycloudflare.com/zalo/callback"  # Dán link ngrok ở trên
STATE = "Ho Chi Minh City"  # Tuỳ chọn, để kiểm tra khi callback

base_url = "https://oauth.zaloapp.com/v4/oa/permission"
params = {
    "app_id": ZALO_APP_ID,
    "redirect_uri": REDIRECT_URI,
    "state": STATE
}

auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"

print("🔗 Truy cập link sau để xác thực và lấy authorization_code:")
print(auth_url)
