import re
import difflib
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Set, Tuple
from app.config import QUOTE_FUZZY_THRESHOLD, QUOTE_MIN_LENGTH
from app.laya.tiers import SourceTier, classify_source_tier

def normalize_text(t: Optional[str]) -> str:
    """Normalize text for consistent comparison."""
    if not t:
        return ""
    return re.sub(r"\W+", " ", str(t).lower()).strip()

# ----------------- Check 1: Citation Exists -----------------
def check_citation_exists(claim: Dict[str, Any], sources: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Verify that cited source IDs exist in the session source registry."""
    source_ids = claim.get("source_ids", [])
    if not source_ids:
        return False, ["no_sources_cited"]

    missing = [sid for sid in source_ids if sid not in sources]
    if missing:
        return False, [f"missing_citation_{sid}" for sid in missing]

    return True, ["citations_exist"]

# ----------------- Check 2: Quote Matches Cited Text -----------------
def quote_match(
    quote: Optional[str],
    text: Optional[str],
    threshold: float = QUOTE_FUZZY_THRESHOLD,
    min_length: int = QUOTE_MIN_LENGTH
) -> bool:
    """
    Verify whether a verbatim quotation is present in the source text.
    Rejects quotations that are too short (< min_length).
    Accepts exact matches, longest common match >= threshold, or clustered matching blocks >= threshold.
    """
    q_norm = normalize_text(quote)
    t_norm = normalize_text(text)

    if len(q_norm) < min_length or not t_norm:
        return False

    # Exact substring match
    if q_norm in t_norm:
        return True

    # Fuzzy longest match using difflib
    matcher = difflib.SequenceMatcher(None, t_norm, q_norm, autojunk=False)
    match = matcher.find_longest_match(0, len(t_norm), 0, len(q_norm))
    if len(q_norm) > 0 and (match.size / len(q_norm)) >= threshold:
        return True

    # Clustered matching blocks check (handles minor omitted words or punctuation in quotes)
    blocks = [b for b in matcher.get_matching_blocks() if b.size >= 3]
    if blocks and len(q_norm) > 0:
        total_matched = sum(b.size for b in blocks)
        if (total_matched / len(q_norm)) >= threshold:
            first_t = min(b.a for b in blocks)
            last_t = max(b.a + b.size for b in blocks)
            if (last_t - first_t) <= (len(q_norm) * 1.5):
                return True

    return False

# ----------------- Check 3: Date Consistency -----------------
YEAR_REGEX = re.compile(r"\b(\d{1,4})\s*(bce|bc|ce|ad)?\b", re.IGNORECASE)

def extract_years_from_text(text: str) -> List[int]:
    """Extract approximate years mentioned in source text."""
    years = []
    for m in YEAR_REGEX.finditer(text or ""):
        num = int(m.group(1))
        era = (m.group(2) or "").lower()
        if "b" in era:
            years.append(-num)
        elif 0 <= num <= 2100:
            years.append(num)
    return years

def check_date_consistency(claim_year: Optional[int], source_texts: List[str]) -> Tuple[bool, str]:
    """
    Verify that the claim's historical date is consistent with dates in cited sources.
    If source text mentions dates, ensure claim date falls within a reasonable temporal window.
    """
    if claim_year is None:
        return True, "undated_claim_consistent"

    all_years = []
    for txt in source_texts:
        all_years.extend(extract_years_from_text(txt))

    if not all_years:
        return True, "no_dates_in_source_to_conflict"

    min_yr = min(all_years)
    max_yr = max(all_years)

    # Allow generous historical margin (within 300 years or century tolerance)
    margin = 350
    if (min_yr - margin) <= claim_year <= (max_yr + margin):
        return True, f"date_{claim_year}_consistent_with_sources"

    return False, f"date_{claim_year}_diverges_from_source_dates_{min_yr}_to_{max_yr}"

# ----------------- Check 4: Source Independence & Shingle Overlap -----------------
def generate_shingles(text: str, k: int = 3) -> Set[str]:
    """Generate k-word shingles for text overlap analysis."""
    words = normalize_text(text).split()
    if len(words) < k:
        return {" ".join(words)} if words else set()
    return {" ".join(words[i:i + k]) for i in range(len(words) - k + 1)}

def jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """Calculate Jaccard similarity between two shingle sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0

def check_source_independence(
    sources_list: List[Dict[str, Any]],
    max_shingle_overlap: float = 0.60
) -> Tuple[bool, int, float, str]:
    """
    Check if cited sources are truly independent:
    1. Must originate from different domain names (netloc).
    2. Must NOT be syndicated verbatim copies (shingle overlap Jaccard < max_shingle_overlap).
    """
    if not sources_list:
        return False, 0, 0.0, "no_sources"

    domains = set()
    shingle_sets: List[Tuple[str, Set[str]]] = []

    for s in sources_list:
        url = s.get("url", "")
        text = s.get("text", "")
        netloc = urlparse(url).netloc.lower()
        if netloc:
            domains.add(netloc)
        shingle_sets.append((netloc or "unknown", generate_shingles(text, k=3)))

    max_overlap = 0.0
    duplicate_pair = None

    for i in range(len(shingle_sets)):
        for j in range(i + 1, len(shingle_sets)):
            sim = jaccard_similarity(shingle_sets[i][1], shingle_sets[j][1])
            if sim > max_overlap:
                max_overlap = sim
                if sim >= max_shingle_overlap:
                    duplicate_pair = (shingle_sets[i][0], shingle_sets[j][0])

    if duplicate_pair:
        return False, len(domains), max_overlap, f"syndicated_duplicate_content_between_{duplicate_pair[0]}_and_{duplicate_pair[1]}"

    is_independent = len(domains) >= 2
    detail = "independent_distinct_domains" if is_independent else "single_domain_source"
    return is_independent, len(domains), max_overlap, detail

# ----------------- Check 5: Source Tier Analysis -----------------
def analyze_source_tiers(sources_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Evaluate source quality tiers across all cited sources."""
    tiers = [classify_source_tier(s) for s in sources_list]
    if not tiers:
        return {
            "best_tier": SourceTier.LEAD_SOCIAL,
            "has_tier_1": False,
            "has_tier_2": False,
            "is_only_social": True,
            "tiers": []
        }

    best_tier = min(tiers)
    has_tier_1 = SourceTier.PRIMARY_ARCHIVE in tiers
    has_tier_2 = SourceTier.PEER_REVIEWED in tiers
    is_only_social = all(t == SourceTier.LEAD_SOCIAL for t in tiers)

    return {
        "best_tier": best_tier,
        "has_tier_1_or_2": has_tier_1 or has_tier_2,
        "is_only_social": is_only_social,
        "tiers": [t.value for t in tiers]
    }

def check_date_sanity(year: Optional[int]) -> bool:
    """Validate reasonable historical bounds."""
    if year is None:
        return True
    return -10000 <= year <= 2100

def count_independent_sources(sources_list: List[Dict[str, Any]]) -> int:
    """Distinct domain count."""
    domains = {urlparse(s.get("url", "")).netloc.lower() for s in sources_list if s.get("url")}
    domains.discard("")
    return len(domains)
