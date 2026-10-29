from dataclasses import dataclass, field
from typing import Tuple, Dict, Any, List, Optional
from app.laya.verdicts import ACCEPT, QUALIFY, INVESTIGATE, REJECT
from app.laya.tiers import SourceTier
from app.laya.checks import (
    check_citation_exists,
    quote_match,
    check_date_consistency,
    check_source_independence,
    analyze_source_tiers
)

@dataclass
class LayaPolicyConfig:
    """Configurable thresholds for the Laya verification policy engine."""
    min_quote_length: int = 20
    quote_fuzzy_threshold: float = 0.85
    max_shingle_overlap: float = 0.60
    require_tier_1_or_2_or_independent: bool = True
    social_cannot_accept: bool = True

DEFAULT_POLICY = LayaPolicyConfig()

class LayaPolicyEngine:
    """
    Configurable historical verification policy engine evaluating 5 core checks:
    1. Citation existence
    2. Verbatim quote matching
    3. Date consistency with source context
    4. Source independence & shingle deduplication
    5. Source tier hierarchy & contradiction resolution
    """
    def __init__(self, config: Optional[LayaPolicyConfig] = None):
        self.config = config or DEFAULT_POLICY

    def evaluate(
        self,
        claim: Dict[str, Any],
        cited_sources: List[Dict[str, Any]],
        llm_verdict: Dict[str, Any],
        graph_contradictions: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[str, List[str], str]:
        """
        Evaluate claim against policy rules.
        Returns (verdict, reasons_list, human_readable_summary).
        """
        reasons: List[str] = []

        # Check 1: Citation existence
        if not cited_sources:
            return REJECT, ["citation_missing", "fabricated_source"], "Cited source does not exist (fabricated citation)."
        reasons.append("citations_exist")

        # Check 2: Verbatim quote match
        quote = claim.get("quote", "")
        quote_verified = any(
            quote_match(quote, s.get("text", ""), threshold=self.config.quote_fuzzy_threshold, min_length=self.config.min_quote_length)
            for s in cited_sources
        )
        if not quote_verified:
            return REJECT, ["quote_verification_failed", "unverified_quote"], "Verbatim quotation not found in cited source text."
        reasons.append("quote_verified")

        # Check 3: Date consistency
        claim_year = claim.get("year")
        source_texts = [s.get("text", "") for s in cited_sources]
        date_ok, date_reason = check_date_consistency(claim_year, source_texts)
        if not date_ok:
            reasons.append(date_reason)
        else:
            reasons.append("date_consistent")

        # Check 4: Source independence & shingle overlap
        is_independent, domain_count, max_shingle_sim, indep_detail = check_source_independence(
            cited_sources,
            max_shingle_overlap=self.config.max_shingle_overlap
        )
        reasons.append(indep_detail)
        if max_shingle_sim >= self.config.max_shingle_overlap:
            reasons.append("high_shingle_text_overlap")

        # Check 5: Source tiers
        tier_analysis = analyze_source_tiers(cited_sources)
        best_tier = tier_analysis["best_tier"]
        has_high_tier = tier_analysis["has_tier_1_or_2"]
        is_only_social = tier_analysis["is_only_social"]
        reasons.append(f"best_tier_{best_tier.name.lower()}")

        # LLM semantic support evaluation
        support = llm_verdict.get("support", "none")
        misrepresents = llm_verdict.get("misrepresents", False)
        llm_note = llm_verdict.get("note", "").strip()

        if misrepresents or support == "none":
            reasons.append("source_text_contradicts_or_misrepresents")
            return REJECT, reasons, llm_note or "Source text does not support the claim or is misrepresented."

        # Rule: Social content (tier 'lead') can never make a claim ACCEPT by itself
        if self.config.social_cannot_accept and is_only_social:
            reasons.append("social_tier_only")
            return INVESTIGATE, reasons, "Only social / lead sources cited; scholarly corroboration required."

        # Rule: Check unresolved CONTRADICTS edges with equal or higher tier
        if graph_contradictions:
            for contra in graph_contradictions:
                contra_tier = contra.get("tier", SourceTier.WEB)
                # If opposing claim has equal or higher tier (lower number = higher tier)
                if contra_tier <= best_tier and contra.get("verdict") in (ACCEPT, QUALIFY, "PENDING"):
                    reasons.append(f"unresolved_contradiction_with_tier_{contra_tier}")
                    return QUALIFY, reasons, f"Competing hypothesis with {contra.get('id', 'contradiction')}; requires qualification."

        # Evidence-Based acceptance rules:
        # 1. category must be 'established'
        # 2. quote verified
        # 3. at least one tier-1/2 source OR two independent sources
        # 4. date must be consistent
        category = claim.get("category", "established")
        if category != "established":
            reasons.append(f"non_established_category_{category}")
            return QUALIFY, reasons, llm_note or f"Categorized as {category}; flagged with uncertainty."

        if support == "partial":
            reasons.append("partial_support")
            return QUALIFY, reasons, llm_note or "Partial evidence support; qualified assertion."

        # Must have high tier source (Tier 1/2) OR 2+ independent sources
        if has_high_tier or (is_independent and domain_count >= 2):
            reasons.append("corroborated_high_confidence")
            return ACCEPT, reasons, "Supported, traceable, quote verified, and corroborated by independent/scholarly sources."

        # Single lower-tier source (e.g. single Wikipedia or general web article)
        reasons.append("single_non_scholarly_source")
        return INVESTIGATE, reasons, "Single non-scholarly source; independent corroboration required."

GLOBAL_POLICY_ENGINE = LayaPolicyEngine()

def evaluate_evidence_policy(
    claim: Dict[str, Any],
    cited_sources: List[Dict[str, Any]],
    llm_verdict: Dict[str, Any],
    graph_contradictions: Optional[List[Dict[str, Any]]] = None
) -> Tuple[str, List[str], str]:
    """Helper forwarding to GLOBAL_POLICY_ENGINE."""
    return GLOBAL_POLICY_ENGINE.evaluate(claim, cited_sources, llm_verdict, graph_contradictions)
