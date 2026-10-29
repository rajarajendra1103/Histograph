import json
from pathlib import Path
import pytest
from app.laya.checks import (
    check_citation_exists,
    check_date_sanity,
    count_independent_sources,
    check_source_independence,
    check_date_consistency
)
from app.laya.policy import evaluate_evidence_policy, LayaPolicyEngine
from app.laya.verdicts import ACCEPT, QUALIFY, INVESTIGATE, REJECT
from app.laya.tiers import SourceTier

@pytest.fixture
def fixtures():
    fixture_path = Path(__file__).parent / "fixtures" / "sample_sources.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        return json.load(f)

# ----------------- Check 1: Citation Exists & Fabricated Citations -----------------
def test_citation_exists(fixtures):
    valid_claim = {"claim": "Harappa declined", "source_ids": ["S1", "S2"]}
    ok, reasons = check_citation_exists(valid_claim, fixtures)
    assert ok is True
    assert "citations_exist" in reasons

def test_fabricated_citation_rejected(fixtures):
    fabricated_claim = {
        "claim": "Urban abandonment in 1900 BCE",
        "quote": "signs of a gradual decline began to emerge",
        "source_ids": ["S999_fabricated"]
    }
    verdict, reasons, summary = evaluate_evidence_policy(
        claim=fabricated_claim,
        cited_sources=[],
        llm_verdict={"support": "full"}
    )
    assert verdict == REJECT
    assert "fabricated_source" in reasons

# ----------------- Check 2: Altered Quotes -----------------
def test_altered_quote_rejected(fixtures):
    # Quote with maliciously altered conclusions
    claim_with_altered_quote = {
        "claim": "Harappan civilization was invaded by aliens",
        "quote": "Many scholars argue that extraterrestrial spacecraft invaded the Ghaggar-Hakra system",
        "source_ids": ["S1"],
        "category": "established"
    }
    sources = [fixtures["S1"]]
    verdict, reasons, summary = evaluate_evidence_policy(
        claim=claim_with_altered_quote,
        cited_sources=sources,
        llm_verdict={"support": "full"}
    )
    assert verdict == REJECT
    assert "quote_verification_failed" in reasons

# ----------------- Check 3: Date Consistency -----------------
def test_date_consistency():
    source_texts = ["Excavations demonstrate urban layers dating between 2600 BCE and 1900 BCE."]
    ok, _ = check_date_consistency(-1900, source_texts)
    assert ok is True

    # Wildly divergent date (e.g. claim asserts 1947 CE for an ancient Bronze Age site)
    ok, reason = check_date_consistency(1947, source_texts)
    assert ok is False
    assert "diverges" in reason

# ----------------- Check 4: Shingle Overlap (Deduplication) -----------------
def test_shingle_overlap_detects_mirror_copy():
    text_a = "The Harappan civilization experienced severe drought and shifting monsoon patterns leading to desertification."
    # Identical verbatim text republished on a separate blog/domain
    text_b = "The Harappan civilization experienced severe drought and shifting monsoon patterns leading to desertification."

    s1 = {"url": "https://source-a.org/article", "text": text_a}
    s2 = {"url": "https://source-b.com/copy", "text": text_b}

    is_indep, domains, overlap, detail = check_source_independence([s1, s2], max_shingle_overlap=0.60)
    assert is_indep is False
    assert overlap >= 0.8
    assert "syndicated_duplicate" in detail

# ----------------- Check 5: Source Tiers & Social Limits -----------------
def test_social_source_alone_cannot_accept(fixtures):
    claim = {
        "claim": "Debate on Harappan hydrology",
        "quote": "Excavation reports at Mohenjo-daro demonstrate unburied skeletons found in street layers",
        "source_ids": ["S_social"],
        "category": "established"
    }
    social_sources = [{
        "kind": "lead",
        "url": "https://reddit.com/r/AskHistorians/test",
        "text": fixtures["S3"]["text"]
    }]
    verdict, reasons, _ = evaluate_evidence_policy(
        claim=claim,
        cited_sources=social_sources,
        llm_verdict={"support": "full"}
    )
    # Social tier can never yield ACCEPT by itself
    assert verdict == INVESTIGATE
    assert "social_tier_only" in reasons

def test_higher_tier_contradiction_demotes_to_qualify(fixtures):
    claim = {
        "claim": "Climate desiccation caused urban abandonment",
        "quote": "Geological and speleothem records indicate a prolonged weakened monsoon",
        "source_ids": ["S2"],
        "category": "established"
    }
    sources = [fixtures["S2"]]  # Tier 2 (scholarly)
    # Graph contradiction from an equal/higher tier source
    contradictions = [{
        "id": "C_alt",
        "claim": "Tectonic shifts diverted the river system",
        "tier": SourceTier.PEER_REVIEWED,
        "verdict": "ACCEPT"
    }]
    verdict, reasons, _ = evaluate_evidence_policy(
        claim=claim,
        cited_sources=sources,
        llm_verdict={"support": "full"},
        graph_contradictions=contradictions
    )
    assert verdict == QUALIFY
    assert any("unresolved_contradiction" in r for r in reasons)

def test_policy_accept(fixtures):
    claim = {
        "claim": "Monsoon reduction impacted Harappan agriculture",
        "quote": "Geological and speleothem records indicate a prolonged weakened monsoon",
        "source_ids": ["S2"],
        "category": "established"
    }
    sources = [fixtures["S2"]]  # Tier 2
    verdict, reasons, _ = evaluate_evidence_policy(
        claim=claim,
        cited_sources=sources,
        llm_verdict={"support": "full"}
    )
    assert verdict == ACCEPT
    assert "quote_verified" in reasons
    assert "corroborated_high_confidence" in reasons
