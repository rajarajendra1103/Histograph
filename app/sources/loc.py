from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text

async def search_loc(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Query Library of Congress API for historical records and digitized items."""
    data = await safe_get_json(
        client,
        "https://www.loc.gov/search/",
        params={"q": query, "fo": "json", "c": 5},
        source_name="loc"
    )
    items = data.get("results", [])
    results: List[Source] = []
    for item in items:
        raw_desc = item.get("description") or []
        desc_str = " ".join(raw_desc) if isinstance(raw_desc, list) else str(raw_desc)
        desc = clean_text(desc_str)
        title = item.get("title") or "Library of Congress Item"
        url = item.get("url") or ""
        date = str(item.get("date")) if item.get("date") else None

        if len(desc) > 40 and url:
            results.append(Source(
                id="",
                title=title,
                url=url,
                text=desc,
                kind="archive",
                date=date
            ))
    return results
