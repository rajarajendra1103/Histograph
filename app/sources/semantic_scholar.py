from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text

async def search_semantic_scholar(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Query Semantic Scholar Graph API for academic papers."""
    data = await safe_get_json(
        client,
        "https://api.semanticscholar.org/graph/v1/paper/search",
        params={
            "query": query,
            "limit": 4,
            "fields": "title,abstract,url,year"
        },
        source_name="semantic_scholar"
    )
    papers = data.get("data", [])
    results: List[Source] = []
    for p in papers:
        abstract = clean_text(p.get("abstract", ""))
        title = p.get("title", "Academic Paper")
        url = p.get("url") or f"https://www.semanticscholar.org/paper/{p.get('paperId')}"
        year = str(p.get("year")) if p.get("year") else None

        if len(abstract) > 50 and url:
            results.append(Source(
                id="",
                title=title,
                url=url,
                text=abstract,
                kind="scholarly",
                date=year
            ))
    return results
