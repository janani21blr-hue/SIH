"""
Graph Engine Module for AI-Powered Criminal Network Analysis System (SIH26189).
Builds a NetworkX network graph from resolved Entity records and Relationship records.
Computes degree centrality, betweenness centrality, PageRank, and Louvain community detection.

Handling Disconnected Subgraphs:
- NetworkX centrality measures (degree_centrality, betweenness_centrality, pagerank) naturally evaluate disconnected components without throwing errors.
- PageRank uses standard random teleportation (alpha=0.85), operating seamlessly over disconnected components.
- Louvain community detection processes each disconnected component independently, placing isolated components into separate community partitions without modularity errors.
"""

from typing import List, Dict, Any, Tuple
import networkx as nx

try:
    import community as community_louvain
except ImportError:
    community_louvain = None


def build_graph(entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]]) -> nx.Graph:
    """
    Constructs an undirected NetworkX graph from resolved entities and relationship records.
    """
    G = nx.Graph()

    # Add resolved entity nodes
    for ent in entities:
        entity_id = ent["entity_id"]
        G.add_node(
            entity_id,
            entity_type=ent.get("entity_type", "person"),
            canonical_name=ent.get("canonical_name", entity_id),
            aliases=ent.get("aliases", []),
            attributes=ent.get("attributes", {}),
            confidence=ent.get("confidence", 1.0)
        )

    # Add relationship edges and infer missing resource/target nodes
    for rel in relationships:
        source = rel["source"]
        target = rel["target"]
        rel_type = rel.get("relationship", "ASSOCIATED")
        conf = rel.get("confidence", 1.0)
        evidence = rel.get("evidence", "")

        # Add target node if not already present (e.g. phone/resource node)
        if not G.has_node(target):
            # Infer entity type (e.g., target named PHONE_17 -> phone resource)
            node_type = "resource"
            if "PHONE" in target.upper():
                node_type = "phone"
            elif "ACCOUNT" in target.upper() or "BANK" in target.upper():
                node_type = "account"
            elif "ADDRESS" in target.upper():
                node_type = "address"

            G.add_node(
                target,
                entity_type=node_type,
                canonical_name=target,
                aliases=[],
                attributes={},
                confidence=conf
            )

        if not G.has_node(source):
            G.add_node(
                source,
                entity_type="person",
                canonical_name=source,
                aliases=[],
                attributes={},
                confidence=conf
            )

        G.add_edge(
            source,
            target,
            relationship=rel_type,
            confidence=conf,
            evidence=evidence
        )

    return G


def compute_community_detection(G: nx.Graph) -> Dict[str, int]:
    """
    Runs Louvain community detection on the graph.
    Handles disconnected subgraphs gracefully by delegating to python-louvain or nx.community.
    """
    if len(G) == 0:
        return {}
    if len(G.edges()) == 0:
        # Each node forms its own isolated community
        return {node: i for i, node in enumerate(G.nodes())}

    if community_louvain is not None:
        # python-louvain library
        return community_louvain.best_partition(G)
    else:
        # Fallback to networkx built-in louvain communities
        communities = nx.community.louvain_communities(G)
        partition = {}
        for comm_id, comm_nodes in enumerate(communities):
            for n in comm_nodes:
                partition[n] = comm_id
        return partition


def analyze_graph(G: nx.Graph) -> Dict[str, Any]:
    """
    Computes graph metrics across the network. Handles disconnected subgraphs without crashing.
    
    Returns a dictionary containing:
    - degree_centrality
    - betweenness_centrality
    - pagerank
    - community_partition (Louvain community mapping node -> community_id)
    - graph_summary (node count, edge count, connected component count)
    """
    if len(G) == 0:
        return {
            "degree_centrality": {},
            "betweenness_centrality": {},
            "pagerank": {},
            "community_partition": {},
            "graph_summary": {"nodes": 0, "edges": 0, "components": 0}
        }

    # Centrality metrics (natively handles disconnected graphs)
    deg_centrality = nx.degree_centrality(G)
    bet_centrality = nx.betweenness_centrality(G)
    pr = nx.pagerank(G) if len(G.edges()) > 0 else {n: round(1.0 / len(G), 4) for n in G.nodes()}

    # Community detection
    partition = compute_community_detection(G)

    # Component metrics
    num_components = nx.number_connected_components(G)

    return {
        "degree_centrality": deg_centrality,
        "betweenness_centrality": bet_centrality,
        "pagerank": pr,
        "community_partition": partition,
        "graph_summary": {
            "nodes": len(G.nodes()),
            "edges": len(G.edges()),
            "components": num_components
        }
    }
