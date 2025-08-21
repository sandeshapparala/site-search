import os
from .fetch_html import fetch_html
from .embeddings import embed_texts
from .tokenise import chunk_text
from .vector_store import ensure_schema, upsert_chunks, del_url, search_by_vector
from .parse_html import clean_html

def index_url(url :str):
    raw = fetch_html(url)
    text, safe_html = clean_html(raw)

    size = int(os.getenv("CHUNK_SIZE", "500"))
    overlap = int(os.getenv("CHUNK_OVERLAP", "50"))

    chunks = chunk_text(text, size, overlap)
    for ch in chunks:
        ch["html"] = f"<p>{ch['text']}</p>"

    vectors = embed_texts([ch["text"] for ch in chunks])

    ensure_schema()
    del_url(url)
    upsert_chunks(url, chunks, vectors)



def semantic_search(url: str, query: str, topk: int):
    vectors = embed_texts([query])
    vec = vectors[0]

    results = search_by_vector(vec, topk, url_filter=url)

    return results