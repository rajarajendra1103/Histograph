from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text
from app.config import CORE_API_KEY

async def search_core(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Query CORE open-access research repository."""
    headers = {"Authorization": f"Bearer {CORE_API_KEY}"} if CORE_API_KEY else {}
    data = await safe_get_json(
        client,
        "https://api.core.ac.uk/v3/search/works",
        params={"q": query, "limit": 4},
        headers=headers,
        source_name="core"
    )
    results: List[Source] = []
    for item in data.get("results", []):
        abstract = clean_text(item.get("abstract", ""))
        title = item.get("title", "CORE Research Paper")
        url = item.get("downloadUrl") or (f"https://core.ac.uk/works/{item.get('id')}" if item.get('id') else "")
        year = str(item.get("yearPublished")) if item.get("yearPublished") else None

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
