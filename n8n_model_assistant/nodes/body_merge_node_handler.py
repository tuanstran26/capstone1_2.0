import json
import ast

def run(step, context):
    print(f"🧩 Thực hiện node merge_body: {step['id']}")

    props = step.get("properties", {})
    sources = props.get("sources", [])
    result_name = props.get("result_name", "merged_body")

    merged = {}

    for key in sources:
        raw = context.to_dict().get(key)

        if raw is None:
            continue

        data = None

        # Case 1: đã là dict
        if isinstance(raw, dict):
            data = raw

        # Case 2: là string → parse
        elif isinstance(raw, str):
            raw = raw.strip()

            # Try JSON
            try:
                data = json.loads(raw)
            except:
                try:
                    # Handle "{'a': 1}" format
                    data = ast.literal_eval(raw)
                except:
                    print(f"⚠️ Không parse được key '{key}':", raw)

        if isinstance(data, dict):
            merged.update(data)

    context.set(result_name, f"{merged}")

    print("📦 Body sau khi merge:", merged)

    return {result_name: merged}, step.get("next")
