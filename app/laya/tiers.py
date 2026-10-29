from enum import IntEnum
from typing import Dict, Any

class SourceTier(IntEnum):
    PRIMARY_ARCHIVE = 1  # Internet Archive, Library of Congress, digitized primary records
    PEER_REVIEWED = 2    # OpenAlex, Crossref, Semantic Scholar, CORE
    ENCYCLOPEDIA = 3     # Wikipedia, standard reference encyclopedias
    WEB = 4              # SearXNG, journalistic & web articles
    LEAD_SOCIAL = 5      # Mastodon, Bluesky, Reddit, YouTube, RSS

TIER_NAMES = {
    SourceTier.PRIMARY_ARCHIVE: "Tier 1: Primary Archive",
    SourceTier.PEER_REVIEWED: "Tier 2: Peer-Reviewed Scholarly",
    SourceTier.ENCYCLOPEDIA: "Tier 3: Encyclopedia",
    SourceTier.WEB: "Tier 4: General Web",
    SourceTier.LEAD_SOCIAL: "Tier 5: Lead / Social",
}

def classify_source_tier(source: Dict[str, Any]) -> SourceTier:
    """Classify a source into its verification tier based on its kind and domain."""
    kind = str(source.get("kind", "")).lower()
    url = str(source.get("url", "")).lower()

    if kind in ("archive", "primary") or "archive.org" in url or "loc.gov" in url:
        return SourceTier.PRIMARY_ARCHIVE

    if kind in ("scholarly", "academic") or any(d in url for d in ("doi.org", "openalex.org", "semanticscholar.org", "core.ac.uk", "crossref.org", "arxiv.org", "ncbi.nlm.nih.gov")):
        return SourceTier.PEER_REVIEWED

    if kind == "encyclopedia" or "wikipedia.org" in url or "britannica.com" in url:
        return SourceTier.ENCYCLOPEDIA

    if kind in ("social", "lead", "video", "discussion", "rss") or any(d in url for d in ("reddit.com", "mastodon", "bsky.app", "bluesky", "youtube.com", "youtu.be")):
        return SourceTier.LEAD_SOCIAL

    return SourceTier.WEB

