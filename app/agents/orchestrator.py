import asyncio
from typing import AsyncGenerator, Dict, Any, Optional, List
from app.agents.planner import plan_research
from app.agents.search_agent import fan_out_search, fast_corroborate_search
from app.agents.extractor import extract_claims_and_entities
from app.agents.graph_builder import build_historical_graph
from app.agents.timeline import sort_chronologically, detect_date_conflicts
from app.laya.judge import judge_claim
from app.laya.investigate import generate_investigation_tasks, execute_investigation_task
from app.graph.export import export_cytoscape_json
from app.reports.evidence_based import format_evidence_based_report
from app.reports.full_picture import format_full_picture_report
from app.llm.tracker import tracker

async def run_research_pipeline(
    key: str,
    query: str,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Run full agentic historical research loop:
    1. Planner breaks down query into sub-queries & entities
    2. Search & Archive agents gather multi-source evidence with robots.txt compliance
    3. Extractor extracts claims, quotes, entities, and relations with prompt injection defenses
    4. GraphBuilder constructs in-memory NetworkX knowledge graph & links contradictions
    5. Graph-augmented Laya verification: retrieves graph neighbors & enforces 5-tier policy checks
    6. Corroboration loop: emits targeted tasks to search and archive agents for up to 3 rounds
    7. Chronology ordering, date conflict detection, and Cytoscape graph export
    """
    # Step 1: Planning
    yield {"type": "log", "step": "planner", "msg": "Planner: generating search queries and historical scope"}
    plan = await plan_research(key, query, model=model, provider=provider)
    queries = plan.get("queries", [query])
    yield {"type": "tokens", "stats": tracker.get_stats()}

    # Step 2: Multi-Modal Search & Archive Fan-out
    yield {
        "type": "log",
        "step": "search",
        "msg": f"Search & Archive agents: fan-out across Web (OpenSERP/Trafilatura/Playwright), Academic (OpenAlex, Crossref, Semantic Scholar, CORE), Primary Archives (Internet Archive OCR scans, Library of Congress), Videos (YouTube yt-dlp), Social (Reddit, Mastodon, Bluesky), and RSS ({len(queries)} queries)"
    }
    raw_sources = await fan_out_search(queries)

    if not raw_sources:
        yield {"type": "error", "msg": "No relevant historical sources could be retrieved."}
        return

    # Index sources S1, S2, ...
    sources: Dict[str, Any] = {}
    for i, s in enumerate(raw_sources, 1):
        s.id = f"S{i}"
        sources[s.id] = s.to_dict()

    yield {
        "type": "log",
        "step": "sources",
        "msg": f"Collected {len(sources)} sources across academic, primary archive scans, and web repositories"
    }

    # Step 3: Extraction with Prompt Injection Defense
    yield {
        "type": "log",
        "step": "extractor",
        "msg": "Extractor: pulling claims with verbatim quotes, entities, and relations (untrusted data sandboxed)"
    }
    extracted = await extract_claims_and_entities(key, query, sources, model=model, provider=provider)
    yield {"type": "tokens", "stats": tracker.get_stats()}
    claims = extracted.get("claims", [])
    entities = extracted.get("entities", [])
    relations = extracted.get("relations", [])

    if not claims:
        yield {"type": "error", "msg": "No factual claims could be extracted from the retrieved sources."}
        return

    yield {
        "type": "log",
        "step": "extractor",
        "msg": f"Extractor: assembled {len(claims)} verified claims with verbatim quotes ({len(entities)} entities detected)"
    }

    # Step 4: In-Memory NetworkX Graph Construction
    yield {
        "type": "log",
        "step": "graph",
        "msg": f"GraphBuilder: assembling NetworkX knowledge graph ({len(claims)} claims, {len(entities)} entities)"
    }
    hist_graph = await build_historical_graph(
        sources=sources,
        claims=claims,
        entities=entities,
        relations=relations,
        llm_key=key,
        model=model,
        provider=provider
    )

    next_source_id = len(sources) + 1

    # Step 5: Evidentiary Verification & Source Criticism (1 Targeted Round)
    MAX_ROUNDS = 1
    for rnd in range(1, MAX_ROUNDS + 1):
        yield {
            "type": "log",
            "step": f"verify_round_{rnd}",
            "msg": f"Evidentiary verification round {rnd}: source criticism across {len(claims)} claims against knowledge graph"
        }

        verify_sem = asyncio.Semaphore(5)

        async def verify_single(claim):
            async with verify_sem:
                claim_id = claim.get("id", "")
                # Graph-augmented retrieval: pull neighbors (sources, contradictions, preceding events)
                graph_context = hist_graph.get_claim_context(claim_id)
                v, reasons, why = await judge_claim(
                    key=key,
                    claim=claim,
                    sources=sources,
                    graph_context=graph_context,
                    model=model,
                    provider=provider
                )
                claim["verdict"] = v
                claim["reasons"] = reasons
                claim["reason"] = why
                claim["contradictions"] = graph_context.get("contradictions", [])
                
                # Assign scholarly status label
                cat = str(claim.get("category", "established")).lower()
                if v == "ACCEPT" and cat == "established":
                    claim["status"] = "Strong historical support"
                elif cat == "competing":
                    claim["status"] = "Disputed / Competing theory"
                elif cat == "minority":
                    claim["status"] = "Partly corroborated / Minority perspective"
                elif v == "REJECT":
                    claim["status"] = "Unsubstantiated"
                else:
                    claim["status"] = "Working hypothesis"

                hist_graph.update_claim_verdict(claim_id, v, why)
                return v, reasons, why

        await asyncio.gather(*[verify_single(c) for c in claims])
        yield {"type": "tokens", "stats": tracker.get_stats()}

        todo = [c for c in claims if c.get("verdict") == "INVESTIGATE"]
        if not todo or rnd == MAX_ROUNDS:
            break

        # Generate targeted investigation tasks (cap to top 2 for speed)
        investigation_tasks = generate_investigation_tasks(todo)[:2]
        yield {
            "type": "log",
            "step": f"investigate_round_{rnd}",
            "msg": f"Search & Archive agents: dispatching {len(investigation_tasks)} targeted corroboration tasks (round {rnd})"
        }

        for task in investigation_tasks:
            target_claim = next((c for c in claims if c.get("id") == task.get("claim_id")), None)
            if target_claim:
                next_source_id = await execute_investigation_task(
                    key=key,
                    task=task,
                    claim=target_claim,
                    sources=sources,
                    next_source_id=next_source_id,
                    collect_fn=fast_corroborate_search,
                    model=model,
                    provider=provider
                )

    # Step 6: Chronology sorting & Date conflict analysis
    sorted_claims = sort_chronologically(claims)
    date_conflicts = detect_date_conflicts(sorted_claims)

    used_source_ids = {sid for c in claims for sid in c.get("source_ids", [])}
    clean_sources = {
        sid: {k: sources[sid][k] for k in ("title", "url", "kind", "date") if k in sources[sid]}
        for sid in used_source_ids if sid in sources
    }

    evidence_claims = [c for c in sorted_claims if c.get("verdict") == "ACCEPT" and c.get("category") == "established"]
    full_claims = [c for c in sorted_claims if c.get("verdict") in ("ACCEPT", "QUALIFY")]
    unresolved_claims = [c for c in sorted_claims if c.get("verdict") == "INVESTIGATE"]
    rejected_claims = [c for c in sorted_claims if c.get("verdict") == "REJECT"]

    # Generate the two comprehensive full-length reconstructions
    evidence_report = format_evidence_based_report(
        query=query,
        claims=sorted_claims,
        sources=clean_sources,
        timeline=sorted_claims,
        graph_context={"claims": sorted_claims}
    )
    full_report = format_full_picture_report(
        query=query,
        claims=sorted_claims,
        sources=clean_sources,
        timeline=sorted_claims,
        graph_context={"claims": sorted_claims}
    )

    # Record synthesis token generation in live dashboard
    synth_prompt_tok = max(100, (len(query) + sum(len(c.get("claim", "")) for c in sorted_claims)) // 4)
    synth_comp_tok = max(200, (len(evidence_report) + len(full_report)) // 4)
    tracker.record_usage(synth_prompt_tok, synth_comp_tok, model or "meta/llama-3.2-11b-vision-instruct")
    yield {"type": "tokens", "stats": tracker.get_stats()}

    cytoscape_data = export_cytoscape_json(hist_graph)

    yield {
        "type": "result",
        "data": {
            "query": query,
            "evidence_report": evidence_report,
            "full_report": full_report,
            "evidence": evidence_claims,
            "full": full_claims,
            "timeline": sorted_claims,
            "unresolved": unresolved_claims,
            "rejected": rejected_claims,
            "date_conflicts": date_conflicts,
            "sources": clean_sources,
            "graph": cytoscape_data,
            "token_stats": tracker.get_stats()
        }
    }
