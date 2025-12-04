# # from flask import Flask, Response, stream_with_context, request, jsonify
# # import os
# # from openai import OpenAI
# #
# # app = Flask(__name__)
# #
# # # Lấy API key từ biến môi trường
# # api_key = "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"
# # if not api_key:
# #     raise RuntimeError("⚠️ Bạn cần set OPENAI_API_KEY trong environment trước khi chạy app")
# #
# # client = OpenAI(api_key=api_key)
# #
# #
# # def ask_llm(prompt: str, model: str = "gpt-4o"):
# #     """Stream token từ OpenAI"""
# #     stream = client.chat.completions.create(
# #         model=model,
# #         messages=[{"role": "user", "content": prompt}],
# #         stream=True,
# #     )
# #     for chunk in stream:
# #         delta = chunk.choices[0].delta.content
# #         if delta:
# #             yield delta
# #
# #
# # # @app.route("/chat", methods=["POST"])
# # # def chat():
# # #     data = request.get_json(silent=True)
# # #     if not data or "prompt" not in data:
# # #         return jsonify({"error": "Request body must be JSON with field 'prompt'"}), 400
# # #
# # #     prompt = data["prompt"].strip()
# # #     if not prompt:
# # #         return jsonify({"error": "Prompt must not be empty"}), 400
# # #
# # #     return Response(stream_with_context(ask_llm(prompt)), mimetype="text/plain")
# # #
# # #
# # # if __name__ == "__main__":
# # #     app.run(debug=True, host="0.0.0.0", port=3000)
# #
# #
# #
# # @app.route("/chat", methods=["POST"])
# # def chat():
# #     data = request.get_json(silent=True)
# #     if not data or "prompt" not in data:
# #         return jsonify({"error": "Request body must be JSON with field 'prompt'"}), 400
# #
# #     prompt = data["prompt"]
# #     return Response(stream_with_context(ask_llm(prompt)), mimetype="text/plain")
# #
# #
# # if __name__ == "__main__":
# #     app.run(debug=True, host="0.0.0.0", port=3000)
#
#
# from flask import Flask, request, Response, stream_with_context
# import os
# from openai import OpenAI
#
# app = Flask(__name__)
#
# # Lấy API key từ biến môi trường
# api_key = "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"
# if not api_key:
#     raise RuntimeError("⚠️ Chưa có OPENAI_API_KEY trong environment")
#
# client = OpenAI(api_key=api_key)
#
#
# def ask_llm(prompt: str, model: str = "gpt-4o"):
#     """Stream text từ OpenAI"""
#     try:
#         stream = client.chat.completions.create(
#             model=model,
#             messages=[{"role": "user", "content": prompt}],
#             stream=True,
#         )
#         for chunk in stream:
#             delta = chunk.choices[0].delta.content
#             if delta:
#                 yield delta
#     except Exception as e:
#         # Nếu có lỗi, vẫn stream ra để client không treo
#         yield f"\n[Error] {str(e)}\n"
#
#
# @app.route("/chat", methods=["POST"])
# def chat():
#     data = request.get_json(silent=True)
#     print(data)
#     if not data or "prompt" not in data:
#         return Response("[Error] Request body must be JSON with field 'prompt'\n",
#                         mimetype="text/plain", status=400)
#
#     prompt = data["prompt"].strip()
#     if not prompt:
#         return Response("[Error] Prompt must not be empty\n",
#                         mimetype="text/plain", status=400)
#
#     return Response(stream_with_context(ask_llm(prompt)),
#                     mimetype="text/plain")
#
#
# if __name__ == "__main__":
#     app.run(debug=True, host="0.0.0.0", port=3000)

from gevent import monkey
monkey.patch_all()

from flask import Flask, request, Response, stream_with_context
import time
import json

app = Flask(__name__)

@app.route("/repeat", methods=["POST"])
def repeat_message():
    data = request.get_json()
    if not data or "message" not in data:
        return Response(
            json.dumps({"error": "Missing 'message' in request body"}),
            mimetype="application/json",
            status=400
        )

    user_message = data["message"]

    def generate():
        for i in range(20):
            time.sleep(0.001)  # mô phỏng xử lý chậm
            chunk = {"reply": f"{i + 1}: {user_message}"}
            # gửi từng JSON object, cách nhau bằng newline
            yield json.dumps(chunk, ensure_ascii=False) + "\n"

    # Stream response
    return Response(
        stream_with_context(generate()),
        mimetype="application/json"
    )


if __name__ == "__main__":
    from gevent import pywsgi
    from gevent.pool import Pool

    pool = Pool(2000)
    server = pywsgi.WSGIServer(
        ("0.0.0.0", 5000),
        app,
        spawn=pool,
        backlog=2048,
    )
    server.serve_forever()
