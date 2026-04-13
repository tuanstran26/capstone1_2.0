import requests
import json
from jinja2 import Template
import re
from openai import OpenAI
from datetime import date
from dotenv import load_dotenv
import os
load_dotenv()

# ⚠️ Điền OpenAI API key của bạn
BASE_URL = "https://api.openai.com/v1"

API_KEY=os.getenv("OPENAI_API_KEY")
def clean_json_string(content):
    pattern = r"```(?:json)?\s*(.*?)```"
    match = re.search(pattern, content, re.DOTALL)
    return match.group(1).strip() if match else content.strip()


def render_prompt(template_str, context):
    context_dict = context.to_dict()
    # temp_cont = context_dict.get("")
    # print("test context dict",temp_cont)

    # Ensure conversation_history is stringified
    conversation_history = context_dict.get("conversation_history", [])
    if isinstance(conversation_history, list):
        context_dict["conversation_history"] = str(conversation_history)

    if not template_str:
        return ""

    template = Template(template_str)
    # print(context_dict)
    today = date.today()
    return template.render(
        context=context_dict,
        final_question=context_dict.get("final_question", ""),
        user_question=context_dict.get("user_question", ""),
        current_table=context_dict.get("current_table", ""),
        selected_fields=context_dict.get("selected_fields", ""),
        tables_list=context_dict.get("tables_json", {}),
        current_table_name=context_dict.get("behavior_json", {}),
        current_table_fields=context_dict.get("fields", []),
        sql_result=context_dict.get("sql_result", ""),
        document_vector_result=context_dict.get("document_vector_result", []),
        today_date=today.isoformat(),
        tables_to_choose=context_dict.get("table_vector_result", []),
        qdrant_answer=context_dict.get("vector_result", []),
        product_list=context_dict.get("product_list", []),
        api_result=context_dict.get("api_result", "")
    )


# def call_lm_studio(prompt, model="gemma-3"):
#     payload = {
#         "model": model,
#         "messages": [{"role": "user", "content": prompt}],
#         "temperature": 0.0,
#     }
#
#     print("promt truoc khi gui", prompt)
#
#     try:
#         response = requests.post("http://localhost:1234/v1/chat/completions", json=payload)
#         response.raise_for_status()
#         result = response.json()
#         content = result["choices"][0]["message"]["content"].strip()
#         print("🧠 Raw LLM output:\n", content)
#
#         clean_content = clean_json_string(content)
#
#         # Try parse JSON, fallback to string
#         try:
#             return json.loads(clean_content)
#         except json.JSONDecodeError:
#             return clean_content
#
#     except Exception as e:
#         print("⚠️ Error calling LM Studio:", e)
#         raise e

def call_openai_api(prompt, model="gpt-4o", api_key=API_KEY):
    try:
        client = OpenAI(api_key=api_key, base_url=BASE_URL)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )

        content = response.choices[0].message.content.strip()
        # print("🧠 Raw LLM output:\n", content)

        clean_content = clean_json_string(content)

        try:
            return json.loads(clean_content)
        except json.JSONDecodeError:
            return clean_content

    except Exception as e:
        print("⚠️ Error calling OpenAI:", e)
        raise e


def run(step, context):
    properties = step.get("properties", {})
    prompt_template = properties.get("prompt", "")
    model = properties.get("model", "gpt-4o")

    rendered_prompt = render_prompt(prompt_template, context)
    print(f"\n🧠 [LLM Node: {step['id']}] Prompt gửi LM:\n{rendered_prompt}\n")

    llm_output = call_openai_api(rendered_prompt, model=model)

    print(f"🧠 Output từ LM:\n{llm_output}\n")

    output_template = step.get("output", {})
    output_dict = {}

    # Update conversation_history
    history = context.get("conversation_history", [])
    if not isinstance(history, list):
        history = []

    assistant_reply = json.dumps(llm_output, ensure_ascii=False) if isinstance(llm_output, dict) else str(llm_output)

    history.append({"role": "assistant", "content": assistant_reply})
    context.set("conversation_history", history)

    # Template output
    for var_name, template in output_template.items():
        jinja_template = Template(template)
        output_dict[var_name] = jinja_template.render(
            **(llm_output if isinstance(llm_output, dict) else {}),
            llm_output=llm_output,
            context=context.to_dict()
        )
    if properties.get("data"):
        context.set(properties.get("data"), output_dict)
    next_step = step.get("next", None)
    # print("✅ Output của node LLM:", output_dict)
    return output_dict, next_step
