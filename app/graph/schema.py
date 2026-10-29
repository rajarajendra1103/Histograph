from enum import Enum

class NodeType(str, Enum):
    EVENT = "Event"
    CLAIM = "Claim"
    PERSON = "Person"
    PLACE = "Place"
    SOURCE = "Source"
    THEORY = "Theory"

class EdgeType(str, Enum):
    SUPPORTS = "SUPPORTS"
    CONTRADICTS = "CONTRADICTS"
    CAUSED = "CAUSED"
    PRECEDES = "PRECEDES"
    MENTIONS = "MENTIONS"
    CITES = "CITES"

VERDICT_COLORS = {
    "ACCEPT": "#2e7d32",       # Green
    "QUALIFY": "#f9a825",      # Amber
    "INVESTIGATE": "#1565c0",  # Blue
    "REJECT": "#c62828",       # Red
    "PENDING": "#78909c"       # Slate
}

NODE_TYPE_COLORS = {
    NodeType.EVENT.value: "#8e24aa",     # Purple
    NodeType.CLAIM.value: "#37474f",     # Dark Slate (overridden by verdict for claims)
    NodeType.PERSON.value: "#00838f",    # Teal
    NodeType.PLACE.value: "#4e342e",     # Brown
    NodeType.SOURCE.value: "#546e7a",    # Blue Grey
    NodeType.THEORY.value: "#d81b60"     # Pink / Magenta
}
