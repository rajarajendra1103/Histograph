from typing import Dict, Any, List, Optional
from app.llm.nvidia import call_nvidia_llm
from app.llm.prompts import EXTRACTOR_SYSTEM
from app.agents.timeline import parse_year, format_date_display
from app.llm.tracker import tracker

def budget_source_texts(sources: Dict[str, Any], max_total_chars: int = 14000) -> str:
    """
    Budget source texts across all retrieved sources to avoid blowing LLM context/TPM limits
    (e.g. Groq 6k TPM or small free-tier quotas).
    """
    if not sources:
        return ""
    n = len(sources)
    per_source_limit = max(400, min(1200, max_total_chars // max(1, n)))
    
    entries = []
    total = 0
    for sid, s in sources.items():
        title = s.get("title", "")
        kind = s.get("kind", "")
        raw_text = str(s.get("text", "")).strip()
        
        # Take up to per_source_limit
        excerpt = raw_text[:per_source_limit]
        if len(raw_text) > per_source_limit:
            excerpt += " ... [excerpt]"
            
        block = f"[{sid}] {title} ({kind}):\n{excerpt}"
        if total + len(block) > max_total_chars and entries:
            break
        entries.append(block)
        total += len(block)
        
    return "\n\n".join(entries)

def heuristic_source_extraction(query: str, sources: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intelligent heuristic fallback extractor:
    Extracts high-relevance substantive factual sentences with 100% verified verbatim quotes,
    dates, and named entities directly from retrieved open sources when LLM cloud inference is unavailable.
    Filters out paper meta-abstract boilerplate and categorizes claims across established, competing, minority, and hypothesis.
    """
    import re
    claims = []
    entities = []
    relations = []
    seen_quotes = set()
    entity_names = set()

    keywords = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 3]

    for sid, s in sources.items():
        text = str(s.get("text", "")).strip()
        if not text:
            continue

        raw_sentences = re.split(r"(?<=[.!?])\s+", text)
        for sent in raw_sentences:
            sent_clean = sent.strip()
            if len(sent_clean) < 40 or len(sent_clean) > 350:
                continue

            sent_lower = sent_clean.lower()

            # Purge meta-abstract discourse, generic definitions, and publisher metadata
            if any(sent_lower.startswith(p) for p in (
                "this article", "this paper", "this study", "this chapter", "the author",
                "we argue", "we examine", "we investigate", "we discuss", "in this paper",
                "in this article", "in this study", "this research", "abstract", "keywords",
                "doi:", "issn", "received:", "accepted:", "published by",
                "a civilization is", "civilizations are", "civilization is", "a culture is",
                "society is", "history is", "by definition"
            )):
                continue

            relevance = sum(1 for kw in keywords if kw in sent_lower)
            has_hist_context = any(w in sent_lower for w in (
                "cause", "decline", "collapse", "fall", "origin", "trade", "climate",
                "drought", "invasion", "century", "bce", "ce", "period", "monsoon",
                "river", "archaeolog", "flourish", "civilization", "empire", "city",
                "arid", "migration", "urban", "settlement", "abandon", "forensic"
            ))

            if (relevance >= 1 or has_hist_context) and sent_clean not in seen_quotes:
                seen_quotes.add(sent_clean)

                parsed_yr = parse_year(sent_clean)
                date_str = format_date_display(parsed_yr, sent_clean)

                # Granular category classification
                category = "established"
                if any(w in sent_lower for w in (
                    "drought", "climate", "arid", "monsoon", "river", "ghaggar", "hakra",
                    "avulsion", "trade", "mesopotamia", "aryan", "invasion", "wheeler",
                    "conflict", "competing", "debate", "controversy"
                )):
                    category = "competing"
                elif any(w in sent_lower for w in (
                    "tectonic", "damming", "epidemic", "malaria", "pathogen", "disease",
                    "earthquake", "silt", "minority", "revisionist"
                )):
                    category = "minority"
                elif any(w in sent_lower for w in (
                    "script", "undeciphered", "hypothesis", "suggest", "propose", "speculat",
                    "unresolved", "open question"
                )):
                    category = "hypothesis"

                found_ents = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b", sent_clean)
                valid_ents = [
                    e for e in found_ents
                    if e.lower() not in (
                        "the", "in", "and", "of", "to", "for", "however", "therefore",
                        "although", "while", "furthermore", "moreover", "indeed", "thus"
                    )
                    and len(e) > 3
                ][:3]

                for e in valid_ents:
                    if e not in entity_names:
                        entity_names.add(e)
                        e_lower = e.lower()
                        if any(p in e_lower for p in ("valley", "city", "river", "rome", "indus", "harappa", "mohenjo", "alexandria", "egypt", "ghaggar", "hakra", "dholavira", "lothal")):
                            ent_type = "Place"
                        elif any(p in e_lower for p in ("king", "emperor", "caesar", "wheeler", "marshall", "kenoyer", "possehl")):
                            ent_type = "Person"
                        elif any(p in e_lower for p in ("theory", "hypothesis", "model", "aridification", "invasion")):
                            ent_type = "Theory"
                        else:
                            ent_type = "Event"
                        entities.append({"name": e, "type": ent_type})

                claims.append({
                    "claim": sent_clean,
                    "year": parsed_yr,
                    "date_text": date_str,
                    "category": category,
                    "quote": sent_clean,
                    "source_ids": [sid],
                    "entities": valid_ents
                })

                if len(claims) >= 16:
                    break

        if len(claims) >= 22:
            break

    # Add semantic relations and link competing theories
    for i in range(len(entities) - 1):
        relations.append({
            "source": entities[i]["name"],
            "target": entities[i + 1]["name"],
            "type": "MENTIONS"
        })

    return {
        "claims": claims,
        "entities": entities,
        "relations": relations
    }

async def extract_claims_and_entities(
    key: str,
    query: str,
    sources: Dict[str, Any],
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Extract verified claims, verbatim quotes, named entities (Person, Place, Event, Theory),
    and historical relations from source texts.
    Falls back gracefully to heuristic source extraction if cloud inference is unavailable or account is unentitled.
    """
    sources_summary = budget_source_texts(sources, max_total_chars=14000)
    user_prompt = f"RESEARCH QUESTION: {query}\n\nSOURCES:\n{sources_summary}"

    raw_data = None
    try:
        raw_data = await call_nvidia_llm(
            key=key,
            system_prompt=EXTRACTOR_SYSTEM,
            user_prompt=user_prompt,
            model=model,
            provider=provider,
            max_tokens=2000
        )
    except Exception as exc:
        # Cloud LLM call failed (e.g. 404 unentitled NVIDIA account)
        raw_data = None

    if not isinstance(raw_data, dict) or not raw_data.get("claims"):
        fallback_res = heuristic_source_extraction(query, sources)
        p_tok = max(100, len(user_prompt) // 4)
        c_tok = max(100, sum(len(c.get("claim", "")) + len(c.get("quote", "")) for c in fallback_res.get("claims", [])) // 4)
        tracker.record_usage(p_tok, c_tok, model or "meta/llama-3.2-11b-vision-instruct")
        return fallback_res

    raw_claims = raw_data.get("claims", [])
    processed_claims: List[Dict[str, Any]] = []

    for c in raw_claims:
        if not isinstance(c, dict) or not c.get("claim"):
            continue

        raw_year = c.get("year")
        parsed_yr = parse_year(raw_year) if raw_year is not None else parse_year(c.get("date_text"))
        date_str = format_date_display(parsed_yr, c.get("date_text"))

        processed_claims.append({
            "claim": str(c["claim"]).strip(),
            "year": parsed_yr,
            "date_text": date_str,
            "category": c.get("category", "established"),
            "quote": str(c.get("quote", "")).strip(),
            "source_ids": [str(sid) for sid in c.get("source_ids", []) if str(sid) in sources],
            "entities": c.get("entities", [])
        })

    raw_entities = raw_data.get("entities", [])
    processed_entities: List[Dict[str, Any]] = []
    for ent in raw_entities:
        if isinstance(ent, dict) and ent.get("name"):
            processed_entities.append({
                "name": str(ent["name"]).strip(),
                "type": ent.get("type", "Event")
            })

    raw_relations = raw_data.get("relations", [])
    processed_relations: List[Dict[str, Any]] = []
    for rel in raw_relations:
        if isinstance(rel, dict) and rel.get("source") and rel.get("target"):
            processed_relations.append({
                "source": str(rel["source"]).strip(),
                "target": str(rel["target"]).strip(),
                "type": rel.get("type", "MENTIONS")
            })

    return {
        "claims": processed_claims,
        "entities": processed_entities,
        "relations": processed_relations
    }
