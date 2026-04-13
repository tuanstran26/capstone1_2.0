from flask import Flask, request, jsonify
import httpx
import json
import re
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

NODE_API_URL = "http://localhost:5000/product/get-related-products"
SAVE_API = "http://localhost:5000/product/save-recommendations"


@app.route("/recommend-products", methods=["POST"])
def recommend_products():
    try:
        data = request.json

        product_id = data.get("id")
        product_name = data.get("name")
        category = data.get("category")

        if not product_id or not category or not product_name:
            return jsonify({"error": "Missing fields"}), 400

        # 🔥 1. Call Node API
        with httpx.Client(timeout=10.0) as client_http:
            response = client_http.post(
                NODE_API_URL,
                json={
                    "id": product_id,
                    "category": category
                }
            )

        if response.status_code != 200:
            return jsonify({"error": "Node API error", "detail": response.text}), 500

        products = response.json()

        if not products:
            return jsonify([])

        # 🔥 2. Build prompt
        prompt = f"""
Return ONLY valid JSON array. No explanation.

Main product:
{product_name}

Products:
{products}

Select top 10 most relevant products.
"""

        # 🔥 3. Call GPT
        ai_response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        content = ai_response.choices[0].message.content

        print("GPT RAW:", content)  # debug

        # 🔥 4. Extract JSON
        match = re.search(r"\[.*\]", content, re.DOTALL)

        if not match:
            return jsonify({
                "error": "AI did not return valid JSON",
                "raw": content
            }), 500

        recommended = json.loads(match.group())
        with httpx.Client() as client_http:
            save_res = client_http.post(
                SAVE_API,
                json={
                    "productId": product_id,
                    "recommendations": recommended
                }
            )

        print("SAVE STATUS:", save_res.status_code)
        print("SAVE RESPONSE:", save_res.text)
        return jsonify(recommended)

    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()

        return jsonify({
            "message": "Internal Server Error",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6999, debug=True)
