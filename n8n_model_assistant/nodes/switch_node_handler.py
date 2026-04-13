import json
import ast

def run(step, context):
    context_dict = context.to_dict()
    node_id = step["id"]
    cases = step.get("cases", {})

    print(f"\n🌀 [Switch] Node: {node_id}")
    # print("📦 Context:", context_dict)
    # print("🎯 Cases:", cases)

    # ============================================
    # Trường hợp đặc biệt theo node ID
    # ============================================

    if node_id == "route_behavior_reset" or node_id == "continue_existing_flow":
        input_value = context_dict.get("behavior")
        print(f"🎯 Special switch: using behavior = {input_value}")

    elif node_id == "route_followup_or_reset":
        # Giá trị flow_decision là JSON string → cần parse
        raw = context_dict.get("flow_decision")

        try:
            if isinstance(raw, str):
                try:
                    # Thử parse JSON chuẩn trước
                    parsed = json.loads(raw)
                except json.JSONDecodeError:
                    # Nếu thất bại, thử parse theo dict Python
                    parsed = ast.literal_eval(raw)
            else:
                parsed = raw  # đã là dict

            input_value = parsed.get("flow_decision")
        except Exception as e:
            raise ValueError(f"❌ Lỗi khi parse flow_decision: {raw} → {e}")
        print(f"🎯 Special switch: using flow_decision = {input_value}")

    elif node_id == "classify_behavior":
        # Giá trị flow_decision là JSON string → cần parse
        print("yooooooooooooooooooooooooooooooooooooooooooooooo")
        behavior_json_str = context.to_dict().get("behavior_json", "")
        print(f"<UNK> Special switch: using behavior_json_str = {behavior_json_str}")
        try:
            behavior_dict = json.loads(behavior_json_str.replace("'", '"'))
            behavior_value = behavior_dict.get("behavior")
            print("🎯 Behavior:", behavior_value)
        except Exception as e:
            behavior_value = behavior_json_str
            print("❌ Không thể parse behavior_json:", e)


        print(behavior_value)
        input_value = str(behavior_value)
        print(f"<UNK> Special switch: using behavior_json = {input_value}")
    else:
        # ============================================
        # Trường hợp switch thông thường
        # ============================================
        input_expr = step.get("input", "")
        input_value = evaluate_input(input_expr, context_dict)
        print(f"🎯 Default switch: input = {input_expr} → value = {input_value}")

    # ============================================
    # Ánh xạ tới các case
    # ============================================
    if not input_value:
        input_value = context_dict.get("behavior_json")
        input_value = str(input_value)
        input_value = json.loads(input_value.replace("'", '"'))
        input_value = input_value.get("behavior")

    if input_value in cases:
        next_step = cases[input_value]
        # print(f"✅ Match case: {input_value} → Next: {next_step}")
        return {}, next_step

    if "default" in cases:
        # print(f"⚠️ No match. Using default → {cases['default']}")
        return {}, cases["default"]

    raise ValueError(f"[switch_node_handler] ❌ No matching case for value: {input_value}")


def evaluate_input(input_expr, context_dict):
    if isinstance(input_expr, str):
        input_expr = input_expr.strip()

        if input_expr.startswith("{{") and input_expr.endswith("}}"):
            key = input_expr[2:-2].strip()
            value = context_dict
            for part in key.split("."):
                if isinstance(value, dict):
                    value = value.get(part)
                else:
                    return None
            return value

    return input_expr
