from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text

async def fetch_ia_ocr_text(client: httpx.AsyncClient, identifier: str) -> str:
    """Fetch digitized full-text OCR scan from Internet Archive where available."""
    ocr_urls = [
        f"https://archive.org/download/{identifier}/{identifier}_djvu.txt",
        f"https://archive.org/stream/{identifier}/{identifier}_djvu.txt"
    ]
    for url in ocr_urls:
        try:
            r = await client.get(url, timeout=6.0, follow_redirects=True)
            if r.status_code == 200 and len(r.text) > 80:
                return clean_text(r.text, max_chars=3000)
        except Exception:
            pass
    return ""

async def search_internet_archive(client: httpx.AsyncClient, query: str) -> List[Source]:
    """
    Query Internet Archive advanced search for historical documents and manuscripts.
    Extracts full-text OCR scan where available, falling back to metadata description.
    """
    data = await safe_get_json(
        client,
        "https://archive.org/advancedsearch.php",
        params={
            "q": query,
            "rows": 4,
            "output": "json",
            "fl[]": ["identifier", "title", "description", "year", "date", "mediatype"]
        },
        source_name="internet_archive"
    )
    docs = data.get("response", {}).get("docs", [])
    results: List[Source] = []

    for d in docs:
        identifier = d.get("identifier")
        if not identifier:
            continue

        raw_desc = d.get("description", "")
        if isinstance(raw_desc, list):
            raw_desc = " ".join(str(x) for x in raw_desc)
        meta_desc = clean_text(raw_desc)

        # Attempt to pull full-text OCR scan
        ocr_text = await fetch_ia_ocr_text(client, identifier)
        final_text = ocr_text if ocr_text and len(ocr_text) > 100 else meta_desc

        title = str(d.get("title") or f"Archive Document {identifier}")
        url = f"https://archive.org/details/{identifier}"
        date = str(d.get("year") or d.get("date") or "") or None

        if len(final_text) > 40:
            results.append(Source(
                id="",
                title=f"[Archive Primary Scan] {title}",
                url=url,
                text=final_text[:2500],
                kind="archive",  # Tier 1: Primary archive
                date=date
            ))

    return results
