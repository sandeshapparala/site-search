import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services.search_flow import index_url, semantic_search

@api_view(["POST"])
def search_view(request):
    url = request.data.get("url")
    query = request.data.get("query")

    if not url or not query:
        return Response({"detail":"url and query are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        index_url(url)  # simple approach: re-index on each request
        topk = int(os.getenv("RESULTS_TOPK", "10"))
        results = semantic_search(url, query, topk=topk)

        return Response({
            "url": url,
            "query": query,
            "count": len(results),
            "results": [
                {
                    "ordinal": r["ordinal"],
                    "score": r["score"],            # may be None in this minimal pass
                    "html_snippet": r["html"],
                    "text_preview": r["text"][:400],
                    "tokens": r["token_count"],
                } for r in results
            ]
        })
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
