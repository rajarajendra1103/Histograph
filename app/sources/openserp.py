import re
import urllib.parse
from typing import List, Dict, Any
import httpx
from app.sources.base import Source, safe_get_json, clean_text
from app.sources.web_render import render_web_page
from app.config import OPENSERP_URL

async def search_openserp(client: httpx.AsyncClient, query: str) -> List[Source]:
    """
    Search the open web using OpenSERP (open-source search API) or built-in web search fallback.
    Extracts full article texts with Trafilatura and Playwright (for dynamic JS).
    """
    urls_to_scrape = []

    # Priority 1: Query OpenSERP endpoint if configured
    if OPENSERP_URL:
        # OpenSERP supports /search?text={query} or /google/search?text={query}
        endpoints = [
            (f"{OPENSERP_URL}/search", {"text": query}),
            (f"{OPENSERP_URL}/google/search", {"text": query}),
        ]
        for ep_url, ep_params in endpoints:
            try:
                data = await safe_get_json(client, ep_url, params=ep_params, source_name="openserp")
                items = data if isinstance(data, list) else data.get("results", [])
                for item in items[:4]:
                    if isinstance(item, dict) and item.get("url"):
                        urls_to_scrape.append((
                            item.get("url"),
                            item.get("title") or "Web Historical Record",
                            item.get("date") or item.get("publishedDate")
                        ))
                if urls_to_scrape:
                    break
            except Exception:
                pass

    # Priority 2: Built-in Open Web Search Fallback (DuckDuckGo API & HTML)
    if not urls_to_scrape:
        try:
            ddg_data = await safe_get_json(
                client,
                "https://api.duckduckgo.com/",
                params={"q": query, "format": "json", "no_html": "1", "skip_disambig": "1"},
                source_name="web_search"
            )
            for topic in ddg_data.get("RelatedTopics", [])[:3]:
                if isinstance(topic, dict) and topic.get("FirstURL"):
                    urls_to_scrape.append((topic.get("FirstURL"), topic.get("Text", "Web Reference")[:80], None))
            if ddg_data.get("AbstractURL"):
                urls_to_scrape.append((ddg_data.get("AbstractURL"), ddg_data.get("Heading", "Web Source"), None))
        except Exception:
            pass

    # Priority 3: Public HTML open search fallback if still empty
    if not urls_to_scrape:
        try:
            r = await client.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                },
                timeout=6.0
            )
            if r.status_code == 200:
                for m in re.finditer(r'//duckduckgo\.com/l/\?uddg=([^&"\']+)', r.text):
                    u = urllib.parse.unquote(m.group(1))
                    if u.startswith('http') and 'duckduckgo.com' not in u:
                        urls_to_scrape.append((u, "Web Article", None))
                        if len(urls_to_scrape) >= 4:
                            break
        except Exception:
            pass

    results: List[Source] = []
    seen_urls = set()

    for url, title, pub_date in urls_to_scrape[:4]:
        if url in seen_urls:
            continue
        seen_urls.add(url)

        # Scrape and render with Trafilatura + Playwright fallback
        text = await render_web_page(client, url)
        if text and len(text) > 80:
            results.append(Source(
                id="",
                title=title,
                url=url,
                text=text[:3000],
                kind="web",
                date=pub_date
            ))

    return results

