import asyncio
from typing import List
import httpx
from app.sources.base import Source
from app.sources.internet_archive import search_internet_archive
from app.sources.loc import search_loc

async def collect_archives(client: httpx.AsyncClient, queries: List[str]) -> List[Source]:
    """Fan-out to primary sources, scans, and digitized archive materials."""
    tasks = []
    for q in queries:
        tasks.append(search_internet_archive(client, q))
        tasks.append(search_loc(client, q))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    collected: List[Source] = []
    seen_urls = set()

    for r in results:
        if isinstance(r, list):
            for s in r:
                if s.url not in seen_urls and len(s.text) > 40:
                    seen_urls.add(s.url)
                    collected.append(s)

    return collected
