from transformers import AutoTokenizer
import os

_tokenizer = None

def get_tokenizer():
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    return _tokenizer

def chunk_text(text:str, size: int, overlap:int):
    tok = get_tokenizer()
    ids = tok.encode(text, add_special_tokens=False)
    chunks = []
    start = 0
    n = len(ids)
    while start < n:
        end = min(start + size, n)
        sub_ids = ids[start:end]
        sub_text = tok.decode(sub_ids, skip_special_tokens=True)
        chunks.append({"text": sub_text, "token_count": len(sub_ids)})
        if end == n:
            break
        start = end - overlap

        if start < 0:
            start = 0

    return chunks