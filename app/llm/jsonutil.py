import re
import json
from typing import Any, Union, Dict, List

def extract_json(text: str) -> Union[Dict[str, Any], List[Any]]:
    """Robustly extract JSON dictionary or list from an LLM response string."""
    if not text or not isinstance(text, str):
        return {}

    # Strip markdown code fences if present (e.g. ```json ... ```)
    cleaned = text.strip()
    code_fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if code_fence_match:
        cleaned = code_fence_match.group(1).strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Find the outermost JSON block [ ... ] or { ... }
    m = re.search(r"([\[{][\s\S]*[\]}])", cleaned)
    if m:
        candidate = m.group(1).strip()
        try:
            return json.loads(candidate)
        except Exception:
            # Try minor sanitization (removing trailing commas before closing braces)
            sanitized = re.sub(r",\s*([\]}])", r"\1", candidate)
            try:
                return json.loads(sanitized)
            except Exception:
                pass

    return {}
