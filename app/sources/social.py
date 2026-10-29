from typing import List
import httpx
from app.sources.base import Source, safe_get_json, clean_text

async def search_mastodon(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Search public Mastodon statuses without requiring login."""
    results: List[Source] = []
    try:
        data = await safe_get_json(
            client,
            "https://mastodon.social/api/v2/search",
            params={"q": query, "type": "statuses", "limit": 3},
            source_name="social"
        )
        statuses = data.get("statuses", [])
        for st in statuses:
            content = clean_text(st.get("content", ""))
            url = st.get("url", "")
            acct = st.get("account", {}).get("acct", "mastodon_user")
            created_at = st.get("created_at")
            if url and len(content) > 50:
                results.append(Source(
                    id="",
                    title=f"Mastodon discussion (@{acct})",
                    url=url,
                    text=content,
                    kind="lead",  # Tier 5: lead only
                    date=created_at
                ))
    except Exception:
        pass
    return results

async def search_bluesky(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Search public Bluesky feed posts using public unauthenticated API."""
    results: List[Source] = []
    try:
        data = await safe_get_json(
            client,
            "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts",
            params={"q": query, "limit": 3},
            source_name="social"
        )
        posts = data.get("posts", [])
        for p in posts:
            record = p.get("record", {})
            text = clean_text(record.get("text", ""))
            handle = p.get("author", {}).get("handle", "bsky_user")
            uri = p.get("uri", "")
            # Construct web link
            rkey = uri.split("/")[-1] if "/" in uri else ""
            url = f"https://bsky.app/profile/{handle}/post/{rkey}" if rkey else "https://bsky.app"
            created_at = record.get("createdAt")
            if len(text) > 50:
                results.append(Source(
                    id="",
                    title=f"Bluesky post (@{handle})",
                    url=url,
                    text=text,
                    kind="lead",  # Tier 5: lead only
                    date=created_at
                ))
    except Exception:
        pass
    return results

async def search_reddit(client: httpx.AsyncClient, query: str) -> List[Source]:
    """Search AskHistorians and academic history discussions via public Reddit JSON."""
    results: List[Source] = []
    try:
        reddit_data = await safe_get_json(
            client,
            "https://www.reddit.com/r/AskHistorians/search.json",
            params={"q": query, "restrict_sr": "1", "sort": "relevance", "limit": 3},
            source_name="social"
        )
        children = reddit_data.get("data", {}).get("children", [])
        for post in children:
            p_data = post.get("data", {})
            title = p_data.get("title", "")
            selftext = clean_text(p_data.get("selftext", ""))
            permalink = p_data.get("permalink")
            url = f"https://www.reddit.com{permalink}" if permalink else ""
            if url and len(title) > 10:
                combined = f"{title}. {selftext}".strip()
                if len(combined) > 60:
                    results.append(Source(
                        id="",
                        title=f"AskHistorians: {title}",
                        url=url,
                        text=combined[:2500],
                        kind="lead",  # Tier 5: lead only
                        date=None
                    ))
    except Exception:
        pass
    return results

async def search_social_sources(client: httpx.AsyncClient, query: str) -> List[Source]:
    """
    Fan-out across unauthenticated public social channels: Mastodon, Bluesky, Reddit.
    All social content is tagged tier 'lead' and can NEVER verify an ACCEPT claim alone.
    """
    results: List[Source] = []
    m_res = await search_mastodon(client, query)
    b_res = await search_bluesky(client, query)
    r_res = await search_reddit(client, query)
    results.extend(m_res)
    results.extend(b_res)
    results.extend(r_res)
    return results
