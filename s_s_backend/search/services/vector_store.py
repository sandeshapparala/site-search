import weaviate
import os
from weaviate.classes.config import Property, DataType, Configure, VectorDistances
from weaviate.classes.query import MetadataQuery, Filter

CLASS_NAME = "HtmlChunk"

def get_weaviate_client():
    url = os.getenv("WEAVIATE_URL", "http://localhost:8080")
    return weaviate.connect_to_local(host="localhost", port=8080)

def ensure_schema():
    with get_weaviate_client() as client:
        if not client.collections.exists(CLASS_NAME):
            client.collections.create(
                name=CLASS_NAME,
                vector_config=Configure.VectorIndex.hnsw(  # Updated from vectorizer_config
                    distance_metric=VectorDistances.COSINE
                ),
                properties=[
                    Property(name="url", data_type=DataType.TEXT),
                    Property(name="ordinal", data_type=DataType.INT),
                    Property(name="html", data_type=DataType.TEXT),
                    Property(name="text", data_type=DataType.TEXT),
                    Property(name="token_count", data_type=DataType.INT),
                ]
            )

def del_url(url: str):
    with get_weaviate_client() as client:
        collection = client.collections.get(CLASS_NAME)
        collection.data.delete_many(
            where=Filter.by_property("url").equal(url)
        )

def upsert_chunks(url: str, chunks: list[dict], vectors):
    with get_weaviate_client() as client:
        collection = client.collections.get(CLASS_NAME)
        
        with collection.batch.dynamic() as batch:
            for i, (ch, vec) in enumerate(zip(chunks, vectors)):
                props = {
                    "url": url,
                    "ordinal": i,
                    "html": ch["html"],
                    "text": ch["text"],
                    "token_count": ch["token_count"]  # Make sure this exists in ch
                }
                batch.add_object(
                    properties=props,
                    vector=vec.tolist() if hasattr(vec, 'tolist') else vec
                )

def search_by_vector(vec, topk: int, url_filter: str = None):
    with get_weaviate_client() as client:
        collection = client.collections.get(CLASS_NAME)
        
        # Build the query using the correct Weaviate v4 API
        filter_failed = False
        try:
            if url_filter:
                # Try the newer API first - passing where parameter directly
                response = collection.query.near_vector(
                    near_vector=vec.tolist() if hasattr(vec, 'tolist') else vec,
                    limit=topk,
                    return_metadata=MetadataQuery(distance=True),
                    where=Filter.by_property("url").equal(url_filter)
                )
            else:
                response = collection.query.near_vector(
                    near_vector=vec.tolist() if hasattr(vec, 'tolist') else vec,
                    limit=topk,
                    return_metadata=MetadataQuery(distance=True)
                )
        except (TypeError, AttributeError):
            # Fallback if 'where' parameter is not supported or chaining doesn't work
            if url_filter:
                query = collection.query.near_vector(
                    near_vector=vec.tolist() if hasattr(vec, 'tolist') else vec,
                    limit=topk * 5,  # Get more results to filter manually
                    return_metadata=MetadataQuery(distance=True)
                )
                try:
                    response = query.where(Filter.by_property("url").equal(url_filter))
                except (AttributeError, TypeError):
                    # If chaining doesn't work, get all results and filter manually
                    response = query
                    filter_failed = True
            else:
                response = collection.query.near_vector(
                    near_vector=vec.tolist() if hasattr(vec, 'tolist') else vec,
                    limit=topk,
                    return_metadata=MetadataQuery(distance=True)
                )
        
        results = [
            {
                "url": obj.properties["url"],
                "ordinal": obj.properties["ordinal"],
                "html": obj.properties["html"],
                "text": obj.properties["text"],
                "token_count": obj.properties["token_count"],
                "score": obj.metadata.distance if obj.metadata else None
            } for obj in response.objects
        ]
        
        # Manual filtering if API filtering failed
        if url_filter and filter_failed:
            results = [r for r in results if r["url"] == url_filter]
            results = results[:topk]  # Limit to requested topk
        
        # Sort results by score (distance) - lower distance means higher similarity
        # Handle None scores by putting them at the end
        results.sort(key=lambda x: x["score"] if x["score"] is not None else float('inf'))
        
        return results

