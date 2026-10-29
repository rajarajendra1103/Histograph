from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text

async def search_crossref(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Query CrossRef API for scholarly publications and abstracts."""
    data = await safe_get_json(
        client,
        "https://api.crossref.org/works",
        params={"query": query, "rows": 4},
        source_name="crossref"
    )
    items = data.get("message", {}).get("items", [])
    results: List[Source] = []
    for item in items:
        abstract = clean_text(item.get("abstract", ""))
        title_list = item.get("title") or ["Scholarly Paper"]
        title = title_list[0] if title_list else "Scholarly Paper"
        url = item.get("URL", "")
        # Date extraction if available
        created_parts = item.get("created", {}).get("date-parts", [[]])[0]
        pub_year = str(created_parts[0]) if created_parts else None

        if len(abstract) > 50 and url:
            results.append(Source(
                id="",
                title=title,
                url=url,
                text=abstract,
                kind="scholarly",
                date=pub_year
            ))
    return results
