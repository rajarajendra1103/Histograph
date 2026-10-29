from typing import List, Dict, Any, Optional
import httpx
from app.sources.base import Source, safe_get_json, clean_text

def reconstruct_abstract(inverted_index: Optional[Dict[str, List[int]]]) -> str:
    """Reconstruct text from OpenAlex's abstract_inverted_index format."""
    if not inverted_index:
        return ""
    words_by_pos = {pos: word for word, positions in inverted_index.items() for pos in positions}
    return " ".join(words_by_pos[pos] for pos in sorted(words_by_pos))

async def search_openalex(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Query OpenAlex for scholarly works and reconstruct abstracts."""
    data = await safe_get_json(
        client,
        "https://api.openalex.org/works",
        params={"search": query, "per_page": 5},
        source_name="openalex"
    )
    results: List[Source] = []
    for w in data.get("results", []):
        abstract = clean_text(reconstruct_abstract(w.get("abstract_inverted_index")))
        if not abstract:
            continue
        title = w.get("title") or "Scholarly Work"
        url = w.get("doi") or w.get("id") or "https://openalex.org"
        pub_year = str(w.get("publication_year")) if w.get("publication_year") else None
        results.append(Source(
            id="",
            title=title,
            url=url,
            text=abstract,
            kind="scholarly",
            date=pub_year
        ))
    return results
