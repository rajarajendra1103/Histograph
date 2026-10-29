import urllib.robotparser
from urllib.parse import urlparse
from typing import Optional
import httpx
import trafilatura
from app.sources.base import clean_text, GLOBAL_RATE_LIMITER, GLOBAL_SOURCE_CACHE
from app.config import USER_AGENT, SOURCE_TIMEOUTS

async def is_allowed_by_robots(client: httpx.AsyncClient, target_url: str) -> bool:
    """Polite robots.txt compliance checker."""
    try:
        parsed = urlparse(target_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        cached = await GLOBAL_SOURCE_CACHE.get(robots_url)
        if cached is None:
            r = await client.get(robots_url, headers=USER_AGENT, timeout=5.0)
            if r.status_code == 200:
                cached = r.text
            else:
                cached = ""
            await GLOBAL_SOURCE_CACHE.set(robots_url, cached)

        if cached:
            rp.parse(cached.splitlines())
            return rp.can_fetch(USER_AGENT["User-Agent"], target_url)
        return True
    except Exception:
        return True

async def extract_web_article(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """Fetch a web page and extract clean text using Trafilatura."""
    try:
        allowed = await is_allowed_by_robots(client, url)
        if not allowed:
            return None

        cached = await GLOBAL_SOURCE_CACHE.get(url)
        if cached is not None:
            return cached

        await GLOBAL_RATE_LIMITER.wait(url)
        timeout = SOURCE_TIMEOUTS.get("web_extract", 20.0)
        r = await client.get(url, headers=USER_AGENT, timeout=timeout, follow_redirects=True)
        if r.status_code != 200:
            return None

        extracted = trafilatura.extract(r.text, include_comments=False, include_tables=True)
        clean = clean_text(extracted or "")
        if clean:
            await GLOBAL_SOURCE_CACHE.set(url, clean)
            return clean
        return None
    except Exception:
        return None
