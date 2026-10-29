import re
from typing import Dict, Any, List, Optional
from app.llm.nvidia import call_nvidia_llm
from app.llm.prompts import PLANNER_SYSTEM

def extract_core_topic(query: str) -> str:
    """Extract the primary historical subject from questions."""
    q = re.sub(r'^(what\s+(caused|happened\s+to|is|was|are|were)\s+(the\s+)?|who\s+was\s+|why\s+did\s+)', '', query, flags=re.IGNORECASE)
    q = re.sub(r'(\?|\.|\!)$', '', q).strip()
    return q or query

async def plan_research(
    key: str,
    query: str,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deconstruct the research question into targeted search queries,
    identifying historical time bounds and entities.
    """
    topic = extract_core_topic(query)

    try:
        plan = await call_nvidia_llm(
            key=key,
            system_prompt=PLANNER_SYSTEM,
            user_prompt=query,
            model=model,
            provider=provider
        )
        if isinstance(plan, dict):
            raw_queries = plan.get("queries", [])
            valid_queries = [query] + [q for q in raw_queries if isinstance(q, str) and q.strip() and q != query][:3]
            return {
                "queries": valid_queries,
                "time_range": plan.get("time_range", {}),
                "target_entities": plan.get("target_entities", [])
            }
    except Exception:
        pass

    # High-precision heuristic query expansion
    expanded_queries = [
        query,
        f"{topic} archaeological evidence primary sources",
        f"{topic} causes competing theories scholarly consensus",
        f"{topic} chronology dates excavations"
    ]

    return {
        "queries": expanded_queries[:3],
        "time_range": {},
        "target_entities": [topic]
    }
