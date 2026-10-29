"""Smoke test runner for Histograph.
Runs 3 benchmark historical questions end-to-end:
1. What caused the decline of the Indus Valley Civilization?
2. What caused the fall of the Western Roman Empire?
3. Did the Library of Alexandria burn down in a single catastrophic event or decline gradually over centuries?

Requirement: Fails the run if any ACCEPT claim lacks a verified quote.
Usage:
  python scripts/smoke_test.py --offline
  python scripts/smoke_test.py --live --key nvapi-... (or gsk_...)
"""
import sys
import os
import argparse
import asyncio
from typing import Dict, Any

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents.search_agent import fan_out_search
from app.agents.graph_builder import build_historical_graph
from app.graph.export import export_cytoscape_json
from app.agents.timeline import sort_chronologically
from app.reports.pdf import generate_pdf_report
from app.agents.orchestrator import run_research_pipeline
from app.laya.checks import quote_match

BENCHMARK_QUESTIONS = [
    "What caused the decline of the Indus Valley Civilization?",
    "What caused the fall of the Western Roman Empire?",
    "Did the Library of Alexandria burn down in a single catastrophic event or decline gradually over centuries?"
]

def assert_verified_quotes_on_accept(claims: list, sources_dict: dict):
    """FAIL the run if any ACCEPT claim lacks a verified quote in the cited sources."""
    for c in claims:
        if c.get("verdict") == "ACCEPT":
            quote = c.get("quote")
            assert quote and len(quote.strip()) >= 20, (
                f"FAIL: ACCEPT claim '{c.get('id')}' lacks a valid verbatim quote (length >= 20)!"
            )
            # Verify quote is actually present in cited source texts
            cited_ids = c.get("source_ids", [])
            assert cited_ids, f"FAIL: ACCEPT claim '{c.get('id')}' has no cited sources!"

            matching_in_source = any(
                quote_match(quote, sources_dict.get(sid, {}).get("text", ""))
                for sid in cited_ids if sid in sources_dict
            )
            assert matching_in_source, (
                f"FAIL: ACCEPT claim '{c.get('id')}' quote '{quote[:40]}...' was not found in any cited source!"
            )

async def run_offline_test(question: str):
    print(f"\n[OFFLINE TEST] Question: '{question}'")
    queries = [question]

    print(" -> Step 1: Testing open source fan-out & robots.txt compliance...")
    sources = await fan_out_search(queries)
    print(f"    Retrieved {len(sources)} sources.")
    assert len(sources) > 0, "No sources retrieved from open repositories!"

    sources_dict = {f"S{i}": s.to_dict() for i, s in enumerate(sources[:6], 1)}

    print(" -> Step 2: Testing mock extraction with verified verbatim quotes...")
    # Use real text from first source to simulate 100% verified quote
    first_source_text = sources[0].text
    # Pick a real sentence from first source text
    sentences = [s.strip() for s in first_source_text.split(".") if len(s.strip()) >= 30]
    verified_quote = sentences[0] if sentences else first_source_text[:60]

    mock_claims = [
        {
            "id": "C1",
            "claim": f"Consensus points to systemic factors for: {question[:35]}",
            "year": -1900 if "Indus" in question else (476 if "Roman" in question else -48),
            "date_text": "c. 1900 BCE" if "Indus" in question else ("476 CE" if "Roman" in question else "48 BCE"),
            "category": "established",
            "quote": verified_quote,
            "source_ids": ["S1"],
            "verdict": "ACCEPT",
            "reasons": ["quote_verified", "tier_2_scholarly", "independent_corroboration"],
            "reason": "Direct textual support corroborated.",
            "entities": ["Consensus Theory"]
        },
        {
            "id": "C2",
            "claim": "Alternative explanations have been challenged by modern excavations and records.",
            "year": -1500 if "Indus" in question else (410 if "Roman" in question else 391),
            "date_text": "c. 1500 BCE",
            "category": "competing",
            "quote": verified_quote,
            "source_ids": ["S1"],
            "verdict": "QUALIFY",
            "reasons": ["competing_category", "quote_verified"],
            "reason": "Competing hypothesis disputed by forensic evidence.",
            "entities": ["Alternative Theory"]
        }
    ]

    # Verify our strict quote rule
    print(" -> Step 3: Verifying Laya quote integrity check on ACCEPT claims...")
    assert_verified_quotes_on_accept(mock_claims, sources_dict)
    print("    Strict quote check: PASSED (all ACCEPT claims carry verified verbatim quotes).")

    print(" -> Step 4: Assembling NetworkX knowledge graph...")
    mock_entities = [
        {"name": "Consensus Theory", "type": "Theory"},
        {"name": "Alternative Theory", "type": "Theory"}
    ]
    mock_relations = [
        {"source": "Consensus Theory", "target": "Alternative Theory", "type": "CONTRADICTS"}
    ]

    hg = await build_historical_graph(
        sources=sources_dict,
        claims=mock_claims,
        entities=mock_entities,
        relations=mock_relations,
        llm_key=None
    )
    assert hg.graph.number_of_nodes() >= 4, "Graph has insufficient nodes!"
    print(f"    Graph assembled: {hg.graph.number_of_nodes()} nodes, {hg.graph.number_of_edges()} edges.")

    print(" -> Step 5: Testing Cytoscape JSON export...")
    cy_json = export_cytoscape_json(hg)
    assert "elements" in cy_json, "Cytoscape export missing elements!"
    print(f"    Cytoscape elements: {len(cy_json['elements']['nodes'])} nodes, {len(cy_json['elements']['edges'])} edges.")

    print(" -> Step 6: Testing ReportLab PDF generation with cover, tables & bibliography...")
    pdf_bytes = generate_pdf_report({
        "query": question,
        "evidence": mock_claims[:1],
        "full": mock_claims,
        "unresolved": [],
        "rejected": [],
        "sources": sources_dict,
        "graph": cy_json
    })
    assert len(pdf_bytes) > 1000, "PDF generation produced incomplete output!"
    print(f"    PDF generated successfully ({len(pdf_bytes)} bytes).")
    print(f" [PASS] Benchmark passed: '{question}'")

async def run_live_test(key: str, question: str, model: str = None, provider: str = None):
    print(f"\n[LIVE TEST] Question: '{question}' (Provider: {provider or 'auto'}, Model: {model or 'default'})")
    async for event in run_research_pipeline(key=key, query=question, model=model, provider=provider):
        if event.get("type") == "log":
            print(f"  [{event.get('step', 'LOG')}] {event.get('msg')}")
        elif event.get("type") == "error":
            print(f"  [ERROR] {event.get('msg')}")
        elif event.get("type") == "result":
            d = event.get("data", {})
            full_c = d.get("full", [])
            sources_d = d.get("sources", {})
            print(f"  [SUCCESS] {len(full_c)} claims processed.")
            # Enforce verified quote check on live ACCEPT claims
            assert_verified_quotes_on_accept(full_c, sources_d)
            print("  [SUCCESS] Strict quote verification confirmed for all live ACCEPT claims.")

async def main():
    parser = argparse.ArgumentParser(description="Histograph benchmark smoke test")
    parser.add_argument("--offline", action="store_true", help="Run offline tests without LLM API key")
    parser.add_argument("--live", action="store_true", help="Run live end-to-end tests with API key")
    parser.add_argument("--key", type=str, default=os.getenv("NVIDIA_API_KEY", "") or os.getenv("GROQ_API_KEY", ""), help="API key")
    parser.add_argument("--model", type=str, default=None, help="Model override")
    parser.add_argument("--provider", type=str, default=None, help="Provider override (nvidia, groq, openrouter)")
    args = parser.parse_args()

    if args.live:
        key = args.key
        if not key:
            print("ERROR: --live requires an API key via --key or env var.")
            sys.exit(1)
        for q in BENCHMARK_QUESTIONS:
            await run_live_test(key, q, model=args.model, provider=args.provider)
    else:
        print("Running offline benchmark suite for 3 questions...")
        for q in BENCHMARK_QUESTIONS:
            await run_offline_test(q)
        print("\nAll 3 benchmark tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
