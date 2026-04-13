from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Any
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

# ===== Khởi tạo Qdrant client & Embedding model =====
client = QdrantClient(host="localhost", port=6333)
embedder = SentenceTransformer("BAAI/bge-m3")
COLLECTION_NAME = "official_general_documents"

# ===== Khởi tạo FastAPI =====
app = FastAPI(title="Qdrant Query API", version="1.0")

# ===== Input schema =====
class QueryRequest(BaseModel):
    user_request: Optional[str] = ""
    metadata: Optional[Dict[str, Any]] = None
    top_k: Optional[int] = 5

# ===== API route =====
@app.post("/query")
def query_qdrant(req: QueryRequest):
    user_request = req.user_request.strip() if req.user_request else ""
    metadata_filter = req.metadata or {}
    top_k = req.top_k or 5

    results = []

    if user_request:
        # Có user_request → query theo vector + metadata
        query_vector = embedder.encode(user_request).tolist()
        search_results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=metadata_filter,
            limit=top_k
        )
        for r in search_results:
            results.append({
                "id": r.id,
                "score": r.score,
                "payload": r.payload
            })
    else:
        # Không có user_request → chỉ query theo metadata
        scroll_results, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=metadata_filter,
            limit=top_k
        )
        for r in scroll_results:
            results.append({
                "id": r.id,
                "payload": r.payload
            })

    return {"chunks": results}


# ===== Entry point khi chạy bằng PyCharm =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("temp_python:app", host="0.0.0.0", port=8000, reload=True)
