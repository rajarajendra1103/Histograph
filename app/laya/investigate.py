import re
from typing import Dict, Any, List, Optional
from app.laya.checks import quote_match
from app.llm.nvidia import call_nvidia_llm
from app.llm.prompts import CORROBORATE_SYSTEM

def generate_investigation_tasks(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generate structured, targeted corroboration tasks for under-evidenced claims.
    Outputs: {"task": "find independent source", "claim_id": cid, "queries": [q1, q2]}
    """
    tasks = []
    for c in claims:
        cid = c.get("id") or "C?"
        claim_text = c.get("claim", "")
        # Clean query terms
        clean_terms = re.sub(r"[^\w\s]", " ", claim_text)
        words = [w for w in clean_terms.split() if len(w) > 3][:8]
        base_query = " ".join(words)

        date_text = c.get("date_text") or (str(c.get("year")) if c.get("year") is not None else "")
        q1 = f"{base_query} {date_text}".strip()
        q2 = f"evidence {base_query}".strip()
        q3 = f"scholarly {base_query}".strip()

        tasks.append({
            "task": "find independent source",
            "claim_id": cid,
            "claim": claim_text,
            "queries": [q1, q2, q3]
        })
    return tasks

async def execute_investigation_task(
    key: str,
    task: Dict[str, Any],
    claim: Dict[str, Any],
    sources: Dict[str, Any],
    next_source_id: int,
    collect_fn,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> int:
    """
    Execute a targeted corroboration task across search and archive agents.
    Discovered sources are inspected for independent confirmation with verbatim quotes.
    """
    queries = task.get("queries", [task.get("claim", "")[:200]])
    new_candidates = await collect_fn(queries)
    existing_urls = {s.get("url") for s in sources.values()}
    new_candidates = [s for s in new_candidates if s.url not in existing_urls]

    if not new_candidates:
        return next_source_id

    # Register new sources into session dictionary
    for s in new_candidates:
        s.id = f"S{next_source_id}"
        next_source_id += 1
        sources[s.id] = s.to_dict()

    prompt_sources = "\n\n".join(
        f'<untrusted_source_data id="{s.id}" title="{s.title}">\n{s.text[:800]}\n</untrusted_source_data>'
        for s in new_candidates
    )
    user_prompt = f"HISTORICAL CLAIM: {claim.get('claim', '')}\n\nCANDIDATE SOURCES:\n{prompt_sources}"

    try:
        corr_json = await call_nvidia_llm(
            key=key,
            system_prompt=CORROBORATE_SYSTEM,
            user_prompt=user_prompt,
            model=model,
            provider=provider
        )
        supporting = corr_json.get("supporting", []) if isinstance(corr_json, dict) else []
        for x in supporting:
            sid = x.get("id")
            quote = x.get("quote", "")
            s_data = sources.get(sid)
            if s_data and quote_match(quote, s_data.get("text", "")):
                if sid not in claim.setdefault("source_ids", []):
                    claim["source_ids"].append(sid)
    except Exception:
        pass

    return next_source_id

async def investigate_claim(
    key: str,
    claim: Dict[str, Any],
    sources: Dict[str, Any],
    next_source_id: int,
    collect_fn,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> int:
    """Convenience single-claim investigator."""
    tasks = generate_investigation_tasks([claim])
    if tasks:
        return await execute_investigation_task(
            key=key,
            task=tasks[0],
            claim=claim,
            sources=sources,
            next_source_id=next_source_id,
            collect_fn=collect_fn,
            model=model,
            provider=provider
        )
    return next_source_id
