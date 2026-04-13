# from engines.executor import WorkflowExecutor
#
# if __name__ == "__main__":
#     executor = WorkflowExecutor("workflow.yaml")
#
#     conversation_history = []
#
#     print("🤖 Trợ lý dữ liệu doanh nghiệp. Gõ 'exit' để thoát.\n")
#
#     while True:
#         user_input = input("❓ Bạn: ")
#         if user_input.lower() in ['exit', 'quit']:
#             break
#
#         conversation_history.append(f"User: {user_input}")
#
#         executor.run(
#             start_step_id="classify_behavior",
#             initial_input={
#                 "user_question": user_input,
#                 "context": {
#                     "conversation_history": "\n".join(conversation_history),
#                     "current_table": executor.context.get("current_table"),
#                     "selected_fields": executor.context.get("selected_fields", []),
#                 }
#             }
#         )
#
#         response = executor.context.get("final_answer")
#         if response:
#             conversation_history.append(f"Bot: {response}")
#             print(f"\n🤖 Bot: {response}\n")


from flask import Flask, request, jsonify
from flask_cors import CORS
from engines.executor import WorkflowExecutor

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app, resources={r"/fitness-assistant": {"origins": "*"}})  # Cho phép FE gọi API

executor = WorkflowExecutor("workflow.yaml")
conversation_history = []


@app.route("/fitness-assistant", methods=["POST"])
def n8n_assistant():
    try:
        data = request.get_json()
        if not data or "user_request" not in data:
            return jsonify({"error": "Missing 'user_request' in request body"}), 400

        user_input = data["user_request"]
        user_pt_info = data["user_pt_info"]
        conversation_history.append(f"User: {user_input}")

        executor.run(
            start_step_id="classify_behavior",
            initial_input={
                "user_question": user_input,
                "context": {
                    "conversation_history": "\n".join(conversation_history),
                    "current_table": executor.context.get("current_table"),
                    "selected_fields": executor.context.get("selected_fields", []),
                },
                "user_pt_info": user_pt_info
            }
        )

        response = executor.context.get("final_answer")
        if response:
            conversation_history.append(f"Bot: {response}")

        return jsonify({"llm_answer": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500






if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7999, debug=True)
