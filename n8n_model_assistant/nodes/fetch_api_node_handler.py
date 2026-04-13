import requests
import time
import json


def run(step, context):
    start_time = time.time()
    print(f"🌐 Thực hiện node api_fetch: {step['id']}")

    props = step.get("properties", {})

    # ===== 1. Đọc cấu hình từ workflow.yaml =====
    method = props.get("method", "GET").upper()
    endpoint = props.get("endpoint")
    headers = props.get("headers", {})
    body_context_key = props.get("body_from_context")
    temp_body = context.to_dict().get(body_context_key, {})
    print("body key", body_context_key)
    print("body contxt", temp_body)
    result_name = props.get("result_name", "api_result")
    timeout = props.get("timeout", 30)

    if not endpoint:
        print("❌ Thiếu endpoint trong node api_fetch")
        return {}, step.get("next")

    # ===== 2. Lấy body từ context =====
    body = {}
    if body_context_key:
        body = context.to_dict().get(body_context_key, {})

        # Nếu body là string (LLM trả về)
        if isinstance(body, str):
            try:
                body = json.loads(body.replace("'", '"'))
            except Exception as e:
                print("❌ Không parse được body JSON:", e)
                body = {}

    # ===== 3. Làm sạch body (bỏ field rỗng) =====
    body = {
        k: v for k, v in body.items()
        if v not in ("", None, [], {})
    }

    # if not body:
    #     body = json.loads(body_context_key)
    print("📦 API body:", body)

    # ===== 4. Gọi API =====
    try:
        if method == "GET":
            response = requests.get(
                endpoint,
                params=body,
                headers=headers,
                timeout=timeout
            )
        else:
            response = requests.request(
                method=method,
                url=endpoint,
                json=body,
                headers=headers,
                timeout=timeout
            )

        response.raise_for_status()

        # Nếu response không phải JSON
        try:
            data = response.json()
        except Exception:
            data = response.text

    except Exception as e:
        print("❌ Lỗi khi gọi API:", e)
        return {}, step.get("next")

    # ===== 5. Ghi kết quả vào context =====
    context.set(result_name, data)

    end_time = time.time()
    print(f"✅ API fetch thành công ({end_time - start_time:.2f}s)")

    return {result_name: data}, step.get("next")
