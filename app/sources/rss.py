from typing import List
import httpx
from app.sources.base import Source, clean_text, safe_get_json
from app.config import USER_AGENT, SOURCE_TIMEOUTS

async def search_rss_sources(client: httpx.AsyncClient, query: str) -> List[Source]:
    """
    Search historical and archaeological RSS feeds for articles matching the research inquiry.
    """
    historical_feeds = [
        "https://www.worldhistory.org/feed/",
        "https://historynewsnetwork.org/feed",
    ]
    keywords = [w.lower() for w in query.split() if len(w) > 3]
    results: List[Source] = []

    for feed_url in historical_feeds:
        entries = await fetch_rss_feed(client, feed_url)
        for e in entries:
            text_lower = (e.title + " " + e.text).lower()
            if any(kw in text_lower for kw in keywords):
                results.append(e)
                if len(results) >= 2:
                    break
        if len(results) >= 3:
            break

    return results

async def fetch_rss_feed(client: httpx.AsyncClient, feed_url: str) -> List[Source]:
    """Parse RSS/Atom feed using feedparser or basic XML parsing."""
    timeout = SOURCE_TIMEOUTS.get("rss", 15.0)
    try:
        r = await client.get(feed_url, headers=USER_AGENT, timeout=timeout)
        if r.status_code != 200:
            return []
        raw = r.text

        try:
            import feedparser
            parsed = feedparser.parse(raw)
            results = []
            for entry in parsed.entries[:5]:
                text = clean_text(entry.get("summary") or entry.get("description") or "")
                if len(text) > 40:
                    results.append(Source(
                        id="",
                        title=entry.get("title", "RSS Feed Entry"),
                        url=entry.get("link", feed_url),
                        text=text,
                        kind="rss",
                        date=entry.get("published")
                    ))
            return results
        except ImportError:
            # Fallback when feedparser is not installed
            import xml.etree.ElementTree as ET
            root = ET.fromstring(raw)
            results = []
            for item in root.findall(".//item")[:5]:
                title = (item.findtext("title") or "Feed Item").strip()
                link = (item.findtext("link") or feed_url).strip()
                desc = clean_text(item.findtext("description") or "")
                pub_date = item.findtext("pubDate")
                if len(desc) > 40:
                    results.append(Source(
                        id="",
                        title=title,
                        url=link,
                        text=desc,
                        kind="rss",
                        date=pub_date
                    ))
            return results
    except Exception:
        return []
