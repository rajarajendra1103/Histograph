import networkx as nx
from typing import Dict, Any, List, Optional
from app.graph.schema import NodeType, EdgeType

class HistoricalGraph:
    """In-memory NetworkX directed graph representing historical claims, sources, events, and entities."""
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_claim_node(
        self,
        claim_id: str,
        claim_text: str,
        year: Optional[int] = None,
        date_text: Optional[str] = None,
        category: str = "established",
        verdict: str = "PENDING",
        reason: str = "",
        quote: str = "",
        source_ids: Optional[List[str]] = None
    ) -> None:
        self.graph.add_node(
            claim_id,
            node_type=NodeType.CLAIM.value,
            label=claim_text[:60] + ("..." if len(claim_text) > 60 else ""),
            full_text=claim_text,
            year=year,
            date_text=date_text or (str(year) if year is not None else "n.d."),
            category=category,
            verdict=verdict,
            reason=reason,
            quote=quote,
            source_ids=source_ids or []
        )

    def add_source_node(
        self,
        source_id: str,
        title: str,
        url: str,
        kind: str = "source",
        date: Optional[str] = None
    ) -> None:
        self.graph.add_node(
            source_id,
            node_type=NodeType.SOURCE.value,
            label=f"[{source_id}] {title[:50]}",
            full_text=title,
            url=url,
            kind=kind,
            date=date
        )

    def add_entity_node(
        self,
        entity_id: str,
        name: str,
        entity_type: str = NodeType.EVENT.value,
        details: Optional[str] = None
    ) -> None:
        valid_types = {t.value for t in NodeType}
        etype = entity_type if entity_type in valid_types else NodeType.EVENT.value
        self.graph.add_node(
            entity_id,
            node_type=etype,
            label=name,
            full_text=name,
            details=details or ""
        )

    def add_relation(
        self,
        u: str,
        v: str,
        edge_type: str = EdgeType.MENTIONS.value,
        reason: Optional[str] = None
    ) -> None:
        if self.graph.has_node(u) and self.graph.has_node(v):
            self.graph.add_edge(
                u, v,
                edge_type=edge_type,
                label=edge_type,
                reason=reason or ""
            )

    def update_claim_verdict(self, claim_id: str, verdict: str, reason: str = "") -> None:
        if self.graph.has_node(claim_id):
            self.graph.nodes[claim_id]["verdict"] = verdict
            if reason:
                self.graph.nodes[claim_id]["reason"] = reason

    def get_claim_context(self, claim_id: str) -> Dict[str, Any]:
        """
        Graph-augmented retrieval:
        Pulls neighbors of a claim (cited sources, contradicting claims, preceding events, mentioned entities)
        to provide multi-hop context for Laya hallucination verification.
        """
        if not self.graph.has_node(claim_id):
            return {"sources": [], "contradictions": [], "preceding_events": [], "entities": []}

        sources = []
        contradictions = []
        preceding_events = []
        entities = []

        # Check out-edges and in-edges (both directions in directed graph)
        neighbors = set(self.graph.successors(claim_id)).union(self.graph.predecessors(claim_id))

        for nbr in neighbors:
            nbr_data = self.graph.nodes[nbr]
            ntype = nbr_data.get("node_type")

            # Check edge attributes
            out_edge = self.graph.get_edge_data(claim_id, nbr) or {}
            in_edge = self.graph.get_edge_data(nbr, claim_id) or {}
            edge_type = out_edge.get("edge_type") or in_edge.get("edge_type", "")

            if ntype == NodeType.SOURCE.value:
                sources.append({
                    "id": nbr,
                    "title": nbr_data.get("full_text", ""),
                    "url": nbr_data.get("url", ""),
                    "kind": nbr_data.get("kind", "")
                })
            elif edge_type == EdgeType.CONTRADICTS.value or (ntype == NodeType.CLAIM.value and out_edge.get("edge_type") == EdgeType.CONTRADICTS.value):
                contradictions.append({
                    "id": nbr,
                    "claim": nbr_data.get("full_text", ""),
                    "category": nbr_data.get("category", ""),
                    "verdict": nbr_data.get("verdict", "")
                })
            elif ntype in (NodeType.EVENT.value, NodeType.THEORY.value):
                if edge_type in (EdgeType.PRECEDES.value, EdgeType.CAUSED.value):
                    preceding_events.append({
                        "id": nbr,
                        "name": nbr_data.get("label", ""),
                        "type": ntype,
                        "relation": edge_type
                    })
                else:
                    entities.append({"id": nbr, "name": nbr_data.get("label", ""), "type": ntype})
            elif ntype in (NodeType.PERSON.value, NodeType.PLACE.value):
                entities.append({"id": nbr, "name": nbr_data.get("label", ""), "type": ntype})

        return {
            "sources": sources,
            "contradictions": contradictions,
            "preceding_events": preceding_events,
            "entities": entities
        }
