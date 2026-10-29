import re
from typing import Dict, Any, List, Optional
from app.graph.store import HistoricalGraph
from app.graph.schema import NodeType, EdgeType
from app.llm.nvidia import call_nvidia_llm
from app.llm.prompts import CONTRADICTION_PROMPT

def detect_heuristic_contradictions(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Heuristic detection of competing explanations addressing the same historical event/cause."""
    contradictions = []
    competing_indices = [
        i for i, c in enumerate(claims)
        if c.get("category") in ("competing", "minority", "hypothesis")
    ]

    cause_keywords = [
        "caused", "cause", "collapse", "decline", "fall", "origin", "invasion",
        "drought", "climate", "arid", "monsoon", "river", "flood", "trade",
        "aryan", "tectonic", "epidemic", "disease", "migration"
    ]

    for idx1 in range(len(competing_indices)):
        i1 = competing_indices[idx1]
        c1_text = claims[i1].get("claim", "").lower()
        for idx2 in range(idx1 + 1, len(competing_indices)):
            i2 = competing_indices[idx2]
            c2_text = claims[i2].get("claim", "").lower()

            # If both claims mention causal/decline factors but differ in specific mechanisms
            shared_cause = any(kw in c1_text and kw in c2_text for kw in cause_keywords)
            if shared_cause and c1_text != c2_text:
                contradictions.append({
                    "claim_1_index": i1,
                    "claim_2_index": i2,
                    "conflict_reason": "Competing hypotheses regarding causal mechanism"
                })
    return contradictions

async def detect_contradicting_claims(
    key: Optional[str],
    claims: List[Dict[str, Any]],
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Identify pairs of claims that address the same causal question with conflicting conclusions."""
    if len(claims) < 2:
        return []

    # Heuristic pass first
    heuristic_conflicts = detect_heuristic_contradictions(claims)

    if not key:
        return heuristic_conflicts

    # If LLM key is available, run prompt-based contradiction analysis for accuracy
    claims_summary = "\n".join(
        f"[{i}] ({c.get('category')}): {c.get('claim')}" for i, c in enumerate(claims)
    )

    try:
        res = await call_nvidia_llm(
            key=key,
            system_prompt=CONTRADICTION_PROMPT,
            user_prompt=claims_summary,
            model=model,
            provider=provider
        )
        if isinstance(res, dict) and "contradictions" in res:
            llm_conflicts = res["contradictions"]
            if llm_conflicts:
                return llm_conflicts
    except Exception:
        pass

    return heuristic_conflicts

async def build_historical_graph(
    sources: Dict[str, Any],
    claims: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    relations: List[Dict[str, Any]],
    llm_key: Optional[str] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> HistoricalGraph:
    """
    Construct the in-memory NetworkX HistoricalGraph:
    - Add Source nodes
    - Add Claim nodes and link to sources (CITES)
    - Add Entity nodes (Person, Place, Event, Theory)
    - Add semantic relations (SUPPORTS, CAUSED, PRECEDES, MENTIONS)
    - Detect and link competing claims (CONTRADICTS)
    """
    hg = HistoricalGraph()

    # 1. Add Source nodes
    for sid, s in sources.items():
        hg.add_source_node(
            source_id=sid,
            title=s.get("title", "Historical Source"),
            url=s.get("url", ""),
            kind=s.get("kind", "source"),
            date=s.get("date")
        )

    # 2. Add Claim nodes and CITES edges
    entity_name_to_id: Dict[str, str] = {}
    for i, c in enumerate(claims, 1):
        claim_id = f"C{i}"
        c["id"] = claim_id
        hg.add_claim_node(
            claim_id=claim_id,
            claim_text=c.get("claim", ""),
            year=c.get("year"),
            date_text=c.get("date_text"),
            category=c.get("category", "established"),
            verdict=c.get("verdict", "PENDING"),
            reason=c.get("reason", ""),
            quote=c.get("quote", ""),
            source_ids=c.get("source_ids", [])
        )

        # Edge from Claim to Source (CITES)
        for sid in c.get("source_ids", []):
            if sid in sources:
                hg.add_relation(claim_id, sid, edge_type=EdgeType.CITES.value)

    # 3. Add Entity nodes (Person, Place, Event, Theory)
    for idx, ent in enumerate(entities, 1):
        ename = ent.get("name", "").strip()
        etype = ent.get("type", NodeType.EVENT.value)
        if ename:
            eid = f"E_{idx}_{re.sub(r'[^a-zA-Z0-9]', '_', ename)[:20]}"
            entity_name_to_id[ename.lower()] = eid
            hg.add_entity_node(entity_id=eid, name=ename, entity_type=etype)

    # 4. Add semantic relations
    for rel in relations:
        src_name = rel.get("source", "").strip().lower()
        tgt_name = rel.get("target", "").strip().lower()
        rtype = rel.get("type", EdgeType.MENTIONS.value)

        u = entity_name_to_id.get(src_name)
        v = entity_name_to_id.get(tgt_name)
        if u and v:
            hg.add_relation(u, v, edge_type=rtype)

    # 5. Link claims to mentioned entities
    for c in claims:
        cid = c.get("id")
        for ent_name in c.get("entities", []):
            eid = entity_name_to_id.get(ent_name.lower())
            if eid and cid:
                hg.add_relation(cid, eid, edge_type=EdgeType.MENTIONS.value)

    # 6. Detect and link competing claims (CONTRADICTS)
    contradictions = await detect_contradicting_claims(llm_key, claims, model=model, provider=provider)
    for conf in contradictions:
        i1 = conf.get("claim_1_index")
        i2 = conf.get("claim_2_index")
        reason = conf.get("conflict_reason", "Mutually exclusive historical conclusions")
        if i1 is not None and i2 is not None and i1 < len(claims) and i2 < len(claims):
            c1_id = claims[i1].get("id")
            c2_id = claims[i2].get("id")
            if c1_id and c2_id and c1_id != c2_id:
                hg.add_relation(c1_id, c2_id, edge_type=EdgeType.CONTRADICTS.value, reason=reason)
                hg.add_relation(c2_id, c1_id, edge_type=EdgeType.CONTRADICTS.value, reason=reason)

    return hg
