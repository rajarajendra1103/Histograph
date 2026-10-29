import asyncio
from typing import List, Callable
import httpx
from app.sources.base import Source
from app.sources.wikipedia import search_wikipedia
from app.sources.openalex import search_openalex
from app.sources.crossref import search_crossref
from app.sources.semantic_scholar import search_semantic_scholar
from app.sources.core_api import search_core
from app.sources.openserp import search_openserp
from app.sources.social import search_social_sources
from app.sources.youtube import search_youtube_historical
from app.sources.rss import search_rss_sources
from app.agents.archive_agent import collect_archives
from app.config import MAX_SOURCES_PER_QUERY

async def fan_out_search(queries: List[str]) -> List[Source]:
    """Fan-out across all configured primary, scholarly, archive, video, and web sources in parallel."""
    source_funcs: List[Callable] = [
        search_wikipedia,
        search_openalex,
        search_crossref,
        search_semantic_scholar,
        search_core,
        search_openserp,           # OpenSERP Web Search (with Trafilatura + Playwright)
        search_youtube_historical, # Historical Videos (yt-dlp captions / Whisper)
        search_social_sources,     # Public Social (Reddit, Mastodon, Bluesky)
        search_rss_sources,        # Historical RSS feeds
    ]

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Fan out standard sources
        tasks = [f(client, q) for q in queries for f in source_funcs]
        # Include archive agent queries
        archive_task = collect_archives(client, queries)

        all_results = await asyncio.gather(*tasks, archive_task, return_exceptions=True)

    collected: List[Source] = []
    seen_urls = set()

    for r in all_results:
        if isinstance(r, list):
            for s in r:
                if isinstance(s, Source) and s.url not in seen_urls and len(s.text) > 60:
                    seen_urls.add(s.url)
                    collected.append(s)

    return collected[:MAX_SOURCES_PER_QUERY]

async def fast_corroborate_search(queries: List[str]) -> List[Source]:
    """Lightweight fast search for targeted claim corroboration (skips heavy yt-dlp & browsers)."""
    async with httpx.AsyncClient(timeout=4.0, follow_redirects=True) as client:
        tasks = [f(client, q) for q in queries[:2] for f in (search_wikipedia, search_openalex, search_crossref)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    collected: List[Source] = []
    seen = set()
    for r in results:
        if isinstance(r, list):
            for s in r:
                if isinstance(s, Source) and s.url not in seen and len(s.text) > 50:
                    seen.add(s.url)
                    collected.append(s)
    return collected[:8]
