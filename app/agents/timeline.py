import re
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict, Any

RANGE_PATTERN = re.compile(
    r"(?:c\.|circa|ca\.)?\s*(\d{1,4})\s*(bce|bc)?\s*(?:-|–|to)\s*(\d{1,4})\s*(bce|bc|ce|ad)?",
    re.IGNORECASE
)

CIRCA_PATTERN = re.compile(r"(?:^|\b|\s)(?:c\.|circa|ca\.|approx\.?)(?:\s|$)", re.IGNORECASE)

BCE_PATTERNS = [
    re.compile(r"(\d+)\s*(?:bce|bc|b\.c\.e\.|b\.c\.)", re.IGNORECASE),
    re.compile(r"(?:bce|bc)\s*(\d+)", re.IGNORECASE),
]

CE_PATTERNS = [
    re.compile(r"(\d+)\s*(?:ce|ad|c\.e\.|a\.d\.)", re.IGNORECASE),
    re.compile(r"(?:ce|ad)\s*(\d+)", re.IGNORECASE),
]

CENTURY_PATTERN = re.compile(r"(\d+)(?:st|nd|rd|th)?\s+century\s*(bce|bc|ce|ad)?", re.IGNORECASE)

@dataclass
class DateSpan:
    year_start: Optional[int]
    year_end: Optional[int]
    is_range: bool
    is_circa: bool
    era: str  # "BCE", "CE", "mixed", "unknown"
    display_text: str

def parse_date_span(date_input: Any) -> DateSpan:
    """
    Parse complex historical date representations:
    Supports ranges (e.g. 'c. 1900-1300 BCE'), circa ('circa 2500 BCE'),
    centuries ('3rd century BCE'), and BCE/CE negative normalization.
    """
    if date_input is None:
        return DateSpan(None, None, False, False, "unknown", "n.d.")

    s = str(date_input).strip()
    if not s:
        return DateSpan(None, None, False, False, "unknown", "n.d.")

    is_circa = bool(CIRCA_PATTERN.search(s))

    # 1. Range check (e.g. "c. 1900-1300 BCE" or "27 BCE - 14 CE")
    rm = RANGE_PATTERN.search(s)
    if rm:
        y1 = int(rm.group(1))
        era1 = (rm.group(2) or "").lower()
        y2 = int(rm.group(3))
        era2 = (rm.group(4) or "").lower()

        # If era2 is BCE but era1 is unspecified, both are BCE (e.g. 1900-1300 BCE)
        if "b" in era2 and not era1:
            era1 = "bce"

        start_yr = -y1 if "b" in era1 else y1
        end_yr = -y2 if "b" in era2 else y2

        # Ensure start is chronologically before end
        if start_yr > end_yr:
            start_yr, end_yr = end_yr, start_yr

        era = "BCE" if start_yr < 0 and end_yr <= 0 else ("mixed" if start_yr < 0 else "CE")
        disp = f"{'c. ' if is_circa else ''}{format_date_display(start_yr)} – {format_date_display(end_yr)}"
        return DateSpan(start_yr, end_yr, True, is_circa, era, disp)

    # 2. Century check
    cm = CENTURY_PATTERN.search(s)
    if cm:
        c_num = int(cm.group(1))
        era_str = (cm.group(2) or "").lower()
        is_bce = "b" in era_str
        start_century = (c_num * 100)
        end_century = ((c_num - 1) * 100) + 1
        if is_bce:
            start_yr = -start_century
            end_yr = -end_century
            return DateSpan(start_yr, end_yr, True, is_circa, "BCE", f"{c_num}th century BCE")
        else:
            return DateSpan(end_century, start_century, True, is_circa, "CE", f"{c_num}th century CE")

    # 3. Single year parse
    single_yr = parse_year(s)
    era = "BCE" if single_yr is not None and single_yr < 0 else ("CE" if single_yr is not None else "unknown")
    disp = format_date_display(single_yr, date_text=s)
    return DateSpan(single_yr, single_yr, False, is_circa, era, disp)

def parse_year(date_str: Any) -> Optional[int]:
    """Parse historical year representation into a normalized integer (BCE = negative)."""
    if date_str is None:
        return None
    if isinstance(date_str, int):
        return date_str

    s = str(date_str).strip()
    if not s:
        return None

    # Already integer string (like "-1900" or "1947")
    if re.match(r"^-?\d+$", s):
        try:
            return int(s)
        except Exception:
            pass

    # BCE patterns
    for pat in BCE_PATTERNS:
        m = pat.search(s)
        if m:
            return -int(m.group(1))

    # Century pattern
    cm = CENTURY_PATTERN.search(s)
    if cm:
        c_num = int(cm.group(1))
        era = (cm.group(2) or "").lower()
        approx_year = (c_num * 100) - 50
        return -approx_year if "b" in era else approx_year

    # CE patterns
    for pat in CE_PATTERNS:
        m = pat.search(s)
        if m:
            return int(m.group(1))

    # Standalone digits
    m = re.search(r"\b(\d{1,4})\b", s)
    if m:
        return int(m.group(1))

    return None

def format_date_display(year: Optional[int], date_text: Optional[str] = None) -> str:
    """Format normalized year integer for human reading (e.g. -2500 -> '2500 BCE')."""
    if date_text and date_text.strip() and not re.match(r"^-?\d+$", date_text.strip()):
        return date_text.strip()
    if year is None:
        return "n.d."
    if year < 0:
        return f"{abs(year)} BCE"
    return str(year)

def sort_chronologically(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort historical claims chronologically, placing undated items at the end."""
    return sorted(claims, key=lambda c: (c.get("year") is None, c.get("year") or 0))

def detect_date_conflicts(claims: List[Dict[str, Any]], tolerance_years: int = 150) -> List[Dict[str, Any]]:
    """
    Detect conflicting dates asserted by different claims/sources for the same event or subject.
    Identifies pairs of claims sharing entities or subjects but disagreeing by > tolerance_years.
    """
    conflicts = []
    for i in range(len(claims)):
        c1 = claims[i]
        y1 = c1.get("year")
        if y1 is None:
            continue
        e1_dict = {e.lower(): e for e in c1.get("entities", [])}

        for j in range(i + 1, len(claims)):
            c2 = claims[j]
            y2 = c2.get("year")
            if y2 is None:
                continue
            e2_set = set(e.lower() for e in c2.get("entities", []))

            # If they share an entity and their dates diverge significantly
            shared_lower = set(e1_dict.keys()).intersection(e2_set)
            if shared_lower and abs(y1 - y2) > tolerance_years:
                shared_display = [e1_dict[k] for k in shared_lower]
                delta_val = abs(y1 - y2)
                d1_str = format_date_display(y1)
                d2_str = format_date_display(y2)
                ent_str = ", ".join(shared_display)
                note_str = f"Divergent chronology between {d1_str} and {d2_str} on subject '{ent_str}' ({delta_val} yr delta)"
                conflicts.append({
                    "claim_1": c1.get("id", f"C{i+1}"),
                    "claim_2": c2.get("id", f"C{j+1}"),
                    "claim1": c1.get("claim", ""),
                    "claim2": c2.get("claim", ""),
                    "date1": d1_str,
                    "date2": d2_str,
                    "year_1": y1,
                    "year_2": y2,
                    "delta": delta_val,
                    "difference_years": delta_val,
                    "shared_entities": shared_display,
                    "shared_entity": ent_str,
                    "warning": note_str,
                    "note": note_str
                })
    return conflicts
