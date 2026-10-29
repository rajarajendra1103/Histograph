import time
import re
import html
import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse
import httpx
from app.config import USER_AGENT, SOURCE_TIMEOUTS, CACHE_TTL_SECONDS

@dataclass
class Source:
    id: str
    title: str
    url: str
    text: str
    kind: str  # encyclopedia, scholarly, archive, web, primary, etc.
    date: Optional[str] = None
    fetched_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "text": self.text,
            "kind": self.kind,
            "date": self.date,
            "fetched_at": self.fetched_at,
        }

class InMemoryCache:
    """Thread-safe and asyncio-friendly in-memory cache keyed by URL."""
    def __init__(self, ttl_seconds: int = CACHE_TTL_SECONDS):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._ttl = ttl_seconds
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            if time.time() - entry["ts"] > self._ttl:
                del self._cache[key]
                return None
            return entry["val"]

    async def set(self, key: str, val: Any) -> None:
        async with self._lock:
            self._cache[key] = {"val": val, "ts": time.time()}

    async def clear(self) -> None:
        async with self._lock:
            self._cache.clear()

GLOBAL_SOURCE_CACHE = InMemoryCache()

class PoliteRateLimiter:
    """Polite per-domain rate limiter to avoid hammering external endpoints."""
    def __init__(self, default_delay: float = 0.5):
        self.default_delay = default_delay
        self._last_access: Dict[str, float] = {}
        self._lock = asyncio.Lock()

    async def wait(self, url: str, delay: Optional[float] = None) -> None:
        try:
            domain = urlparse(url).netloc or "default"
        except Exception:
            domain = "default"
        delay = delay if delay is not None else self.default_delay

        async with self._lock:
            now = time.time()
            last = self._last_access.get(domain, 0.0)
            elapsed = now - last
            if elapsed < delay:
                sleep_time = delay - elapsed
            else:
                sleep_time = 0.0
            self._last_access[domain] = now + sleep_time

        if sleep_time > 0:
            await asyncio.sleep(sleep_time)

GLOBAL_RATE_LIMITER = PoliteRateLimiter()

def clean_text(raw: str, max_chars: int = 2500) -> str:
    """Unescape HTML, strip tags, and collapse excess whitespace."""
    if not raw:
        return ""
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(raw)))
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_chars]

async def safe_get_json(
    client: httpx.AsyncClient,
    url: str,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    source_name: str = "default",
    use_cache: bool = True
) -> Dict[str, Any]:
    """Helper to fetch JSON with rate limiting, per-source timeout, and caching."""
    cache_key = f"{url}?{sorted((params or {}).items())}"
    if use_cache:
        cached = await GLOBAL_SOURCE_CACHE.get(cache_key)
        if cached is not None:
            return cached

    await GLOBAL_RATE_LIMITER.wait(url)
    timeout = SOURCE_TIMEOUTS.get(source_name, SOURCE_TIMEOUTS["default"])
    req_headers = dict(USER_AGENT)
    if headers:
        req_headers.update(headers)

    try:
        r = await client.get(url, params=params, headers=req_headers, timeout=timeout)
        r.raise_for_status()
        data = r.json()
        if use_cache:
            await GLOBAL_SOURCE_CACHE.set(cache_key, data)
        return data
    except Exception:
        return {}
