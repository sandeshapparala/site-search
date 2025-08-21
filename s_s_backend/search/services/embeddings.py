from sentence_transformers import SentenceTransformer
import os

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        _model = SentenceTransformer(model_name)
    return _model

def embed_texts(texts: list[str]):
    model = get_embedding_model()
    return model.encode(texts, convert_to_tensor=True, show_progress_bar=True, normalize_embeddings=True)