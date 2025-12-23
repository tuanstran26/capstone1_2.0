from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, SearchRequest
from langchain_community.embeddings import HuggingFaceEmbeddings
import ast
import json
import time

model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
client = QdrantClient(host="localhost", port=6333)


def run(step, context):
    start_time = time.time()
    print(f"🔍 Thực hiện node vector_search: {step['id']}")

    qdrant_url = step["properties"].get("qdrant_url", "localhost")
    collection = step["properties"]["collection_name"]
    if collection == "qdrant_collection":
        table_input_value = context.to_dict().get("behavior_json")
        table_input_value = str(table_input_value)
        table_input_value = json.loads(table_input_value.replace("'", '"'))
        table_input_value = table_input_value.get("table_name")
        collection = table_input_value
        collection = collection.replace("[Dynamic].[", "").replace("]", "")
        # print(f"qdrant collection: {table_input_value}")

    if step["id"] == "fields_search" :
        input_value = context.to_dict().get("behavior_json")
        # print(f"qdrant input value: {input_value}")
        input_value = str(input_value)
        input_value = json.loads(input_value.replace("'", '"'))
        input_value = input_value.get("description")
        search_text = str(input_value)
        limit_number = 1
        # print(f"qdrant search text: {search_text}")

    else:
        search_value = step["properties"]["search_value"]
        search_text = context.to_dict().get(search_value)
        search_text = str(search_text)
        limit_number = 20
        # print(f"qdrant search text: {search_text}")

    return_fields = step["properties"].get("return_fields", [])
    score_threshold = step["properties"].get("score_threshold", 0.4)



    if not search_text:
        print("❌ Không có search_value trong context.")
        return {}, step.get("next")

    try:
        if isinstance(search_text, str) and search_text.strip().startswith(("[", "{")):
            arr = ast.literal_eval(search_text)
            result = " ".join(arr) if isinstance(arr, list) else str(arr)
        else:
            result = str(search_text)
    except Exception as e:
        print("❌ Không thể parse search_text:", e)
        return {}, step.get("next")

    # print("🔎 Vector search value:", result)

    embedding_vector = model.embed_query(result)


    # Kiểm tra filter metadata
    qdrant_filter = None
    metadata_filter_key = step["properties"].get("metadata_filter")
    # metadata_filter_key = """  "{ "must": [ { "key": "chunk_id", "match": { "value": 580 } } ] }"  """
    if metadata_filter_key:
        metadata_filter_str = context.to_dict().get(metadata_filter_key, "")
        try:
            metadata_filter = json.loads(metadata_filter_str.replace("'", '"'))
            qdrant_filter = Filter(**metadata_filter)
            print(f"⚠️ Sử dụng metadata_filter: {qdrant_filter}")
        except Exception as e:
            print("❌ Không thể parse metadata_filter:", e)

    # Thực hiện search ban đầu (top 1)
    hits = client.search(
        collection_name=collection,
        query_vector=embedding_vector,
        limit=limit_number,
        with_payload=True,
        query_filter=qdrant_filter
    )

    if not hits:
        print("❌ Không tìm thấy kết quả từ Qdrant.")
        return {}, step.get("next")

    # for hit in hits:
    #     print("Bảng", hit)

    array_result=[]
    if limit_number == 20:
        for hit in hits:
            payload = hit.payload or {}
            item = {
                "description": payload.get("description"),
                "table_name": payload.get("table_name")
            }
            array_result.append(item)

    top_hit = hits[0]
    # print(f"🔍 Top hit score: {top_hit.score:.4f}")
    # print(hits[0])
    if limit_number == 1:
        payload = hits[0].payload or {}
        items = payload.get("fields", [])
        for item in items:
            array_result.append(item)
    results = []
    for hit in hits:
        payload = hit.payload or {}
        item = {field: payload.get(field) for field in return_fields}
        results.append(item)

    # print(f"✅ Tổng số kết quả Qdrant: {len(results)}")

    # Nếu có table_name thì set lại context["qdrant_collection"] (từ hit đầu tiên)
    # if results and results[0].get("table_name"):
    #     table_name_raw = results[0]["table_name"]
    #     table_name_clean = table_name_raw.replace("[Dynamic].[", "").replace("]", "")
    #     context.set("qdrant_collection", table_name_clean)

    # Ghi vào context và trả về




    # Xử lý chunk_require nếu có
    chunk_require = step["properties"].get("chunk_require")
    if not chunk_require:
        output_name = step["properties"].get("result_name")
        output_name = str(output_name)
        # print(f"Qdrant output name: {output_name}")
        context.set(output_name, array_result)
        end_time = time.time()
        print(f"Thời gian chạy table: {end_time - start_time:.4f} giây")
        return {output_name: array_result}, step.get("next")

    if chunk_require:
        chunk_require = int(chunk_require)
        print(f"📦 Đang tìm tối đa {chunk_require} chunks với threshold {score_threshold}")

        limit = chunk_require
        hits = client.search(
            collection_name=collection,
            query_vector=embedding_vector,
            limit=limit,
            with_payload=True,
            query_filter=qdrant_filter
        )

        while len(hits) < chunk_require and score_threshold > 0.1:
            score_threshold -= 0.05
            print(f"🔄 Chưa đủ {chunk_require} chunks → hạ threshold còn {score_threshold:.2f}")
            hits = client.search(
                collection_name=collection,
                query_vector=embedding_vector,
                limit=chunk_require * 2,
                with_payload=True,
                query_filter=qdrant_filter
            )
            hits = [h for h in hits if h.score >= score_threshold]

        hits = hits[:chunk_require]
        print(f"✅ Tổng số chunks lấy được: {len(hits)}")

        results = []
        for hit in hits:
            result = {field: hit.payload.get(field) for field in return_fields}
            results.append(result)

        result_name = step["properties"].get("result_name", "vector_result")
        context.set(result_name, results)
        return {result_name: results}, step.get("next")



    if top_hit.score < score_threshold:
        print(f"⚠️ Score thấp hơn threshold ({score_threshold}) → Bỏ qua.")
        return {}, step.get("next")

    payload = top_hit.payload
    result = {field: payload.get(field) for field in return_fields}
    print("✅ Kết quả Qdrant:", result)
    if result["table_name"]:
        table_name_raw = result["table_name"]
        table_name_clean = table_name_raw.replace("[Dynamic].[", "").replace("]", "")
        context.set("qdrant_collection", table_name_clean)
    end_time = time.time()

    print(f"Thời gian chạy document: {end_time - start_time:.4f} giây")
    context.set("vector_result", result)
    return {"vector_result": result}, step.get("next")
