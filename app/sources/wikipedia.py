from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text

async def search_wikipedia(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Search Wikipedia API for historical articles and extracts."""
    data = await safe_get_json(
        client,
        "https://en.wikipedia.org/w/api.php",
        params={
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrlimit": 4,
            "prop": "extracts|pageprops",
            "explaintext": 1,
            "exintro": 1,
            "exlimit": 4,
            "format": "json"
        },
        source_name="wikipedia"
    )
    pages = data.get("query", {}).get("pages", {})
    results: List[Source] = []
    generic_titles = {"civilization", "civilisation", "culture", "society", "history", "human", "cradle of civilization"}

    for p in pages.values():
        title = p.get("title", "Wikipedia Article")
        # Filter out overly generic dictionary pages if search is specific
        if title.lower() in generic_titles and len(query.split()) > 2:
            continue

        extract = clean_text(p.get("extract", ""))
        if not extract:
            continue
        page_id = p.get("pageid", "")
        results.append(Source(
            id="",
            title=title,
            url=f"https://en.wikipedia.org/?curid={page_id}" if page_id else "https://en.wikipedia.org",
            text=extract,
            kind="encyclopedia",
            date=None
        ))
    return results
