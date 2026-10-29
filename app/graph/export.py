from typing import Dict, Any, List
from app.graph.store import HistoricalGraph
from app.graph.schema import NodeType, VERDICT_COLORS, NODE_TYPE_COLORS

def export_cytoscape_json(hist_graph: HistoricalGraph) -> Dict[str, Any]:
    """Export the NetworkX historical graph to Cytoscape.js elements format."""
    g = hist_graph.graph
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    for node_id, data in g.nodes(data=True):
        ntype = data.get("node_type", NodeType.CLAIM.value)
        verdict = data.get("verdict", "PENDING")
        cat = str(data.get("category", "")).lower()

        # Dynamic vivid color assignment matching UI legend
        if ntype == NodeType.CLAIM.value:
            if cat == "established" or verdict == "ACCEPT":
                color = "#16a34a"  # Green - Consensus
            elif cat == "competing" or verdict == "QUALIFY":
                color = "#eab308"  # Amber - Competing
            elif cat in ("minority", "hypothesis") or verdict == "INVESTIGATE":
                color = "#3b82f6"  # Blue - Working Hypothesis
            elif verdict == "REJECT":
                color = "#ef4444"  # Red - Rejected
            else:
                color = "#16a34a"
            shape = "round-rectangle"
        elif ntype == NodeType.SOURCE.value:
            color = "#64748b"  # Slate
            shape = "barrel"
        elif ntype == NodeType.THEORY.value:
            color = "#db2777"  # Magenta
            shape = "diamond"
        elif ntype == NodeType.EVENT.value:
            color = "#9333ea"  # Purple
            shape = "hexagon"
        elif ntype == NodeType.PERSON.value:
            color = "#0891b2"  # Cyan
            shape = "triangle"
        elif ntype == NodeType.PLACE.value:
            color = "#d97706"  # Orange
            shape = "pentagon"
        else:
            color = "#0284c7"
            shape = "round-rectangle"

        nodes.append({
            "data": {
                "id": str(node_id),
                "label": str(data.get("label", node_id)),
                "node_type": ntype,
                "kind": ntype,
                "type": ntype,
                "category": cat,
                "full_text": str(data.get("full_text", "")),
                "verdict": verdict,
                "reason": str(data.get("reason", "")),
                "quote": str(data.get("quote", "")),
                "source_ids": data.get("source_ids", []),
                "date_text": str(data.get("date_text", "")),
                "color": color,
                "shape": shape
            }
        })

    edge_counter = 0
    for u, v, data in g.edges(data=True):
        edge_counter += 1
        etype = data.get("edge_type", "MENTIONS")
        line_style = "solid"
        edge_color = "#9e9e9e"

        if etype == "CONTRADICTS":
            edge_color = "#d32f2f"
            line_style = "dashed"
        elif etype == "SUPPORTS":
            edge_color = "#388e3c"
        elif etype == "CAUSED":
            edge_color = "#f57c00"
        elif etype == "PRECEDES":
            edge_color = "#7b1fa2"
        elif etype == "CITES":
            edge_color = "#1976d2"
            line_style = "dotted"

        edges.append({
            "data": {
                "id": f"e{edge_counter}",
                "source": str(u),
                "target": str(v),
                "label": etype,
                "edge_type": etype,
                "color": edge_color,
                "line_style": line_style,
                "reason": str(data.get("reason", ""))
            }
        })

    return {
        "elements": {
            "nodes": nodes,
            "edges": edges
        }
    }
