"""
Risk Engine Module for AI-Powered Criminal Network Analysis System (SIH26189).
Computes risk and anomaly scores using scikit-learn Z-score standardization.

Justification for Z-Score Standardization over Isolation Forest:
Graph centrality metrics (betweenness, degree, PageRank) and shared resource counts in network analysis
are structured continuous distributions. Z-Score standardization (via sklearn StandardScaler / Z-Score)
provides deterministic, reproducible, and fully interpretable anomaly metrics relative to network distribution.
Unlike Isolation Forest, which uses randomized decision tree partitions that introduce non-deterministic variance
on small graph inputs, Z-Score guarantees exact, stable risk scoring directly traceable to underlying graph metrics.
"""

from typing import List, Dict, Any
import numpy as np
from sklearn.preprocessing import StandardScaler
import networkx as nx


def compute_risk_scores(G: nx.Graph, graph_analytics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes anomaly and risk scores for all nodes in the graph using Z-score standardization.
    Flags high-risk patterns:
    1. Bridge Entities (high betweenness centrality crossing communities)
    2. Shared-Resource Clusters (single phone/account linked to multiple entities)
    3. Unusually Dense Communities (high intra-community connection density)
    """
    nodes = list(G.nodes())
    if not nodes:
        return {"node_risk": {}, "flagged_patterns": [], "high_risk_entities": []}

    bet_dict = graph_analytics.get("betweenness_centrality", {})
    deg_dict = graph_analytics.get("degree_centrality", {})
    pr_dict = graph_analytics.get("pagerank", {})
    comm_partition = graph_analytics.get("community_partition", {})

    # Extract feature matrix for nodes
    feature_list = []
    for node in nodes:
        b_val = bet_dict.get(node, 0.0)
        d_val = deg_dict.get(node, 0.0)
        p_val = pr_dict.get(node, 0.0)
        raw_degree = G.degree(node) if G.has_node(node) else 0
        feature_list.append([b_val, d_val, p_val, raw_degree])

    X = np.array(feature_list, dtype=float)

    # Standardize using sklearn StandardScaler (Z-Score computation)
    scaler = StandardScaler()
    if len(nodes) > 1 and np.std(X, axis=0).any():
        X_zscore = scaler.fit_transform(X)
    else:
        X_zscore = np.zeros_like(X)

    node_risk: Dict[str, Dict[str, Any]] = {}
    flagged_patterns: List[Dict[str, Any]] = []
    high_risk_entities: List[str] = []

    for idx, node in enumerate(nodes):
        node_attr = G.nodes[node]
        b_val = bet_dict.get(node, 0.0)
        d_val = deg_dict.get(node, 0.0)
        z_bet = float(X_zscore[idx, 0])
        z_deg = float(X_zscore[idx, 1])

        # Composite Risk Score normalized [0, 1] via Sigmoid transform on Z-scores
        z_composite = 0.5 * z_bet + 0.3 * z_deg + 0.2 * float(X_zscore[idx, 2])
        norm_risk_score = round(float(1 / (1 + np.exp(-z_composite))), 4)

        risk_level = "LOW"
        if norm_risk_score >= 0.75 or z_bet > 1.5:
            risk_level = "CRITICAL" if norm_risk_score >= 0.85 else "HIGH"
            high_risk_entities.append(node)
        elif norm_risk_score >= 0.50:
            risk_level = "MEDIUM"

        node_risk[node] = {
            "entity_id": node,
            "canonical_name": node_attr.get("canonical_name", node),
            "entity_type": node_attr.get("entity_type", "person"),
            "risk_score": norm_risk_score,
            "risk_level": risk_level,
            "z_betweenness": round(z_bet, 4),
            "z_degree": round(z_deg, 4),
            "betweenness_centrality": round(b_val, 4),
            "community_id": comm_partition.get(node, 0)
        }

    # 1. Detect Bridge Entities
    for node, rdata in node_risk.items():
        if rdata["betweenness_centrality"] > 0.1 or rdata["z_betweenness"] > 1.0:
            neighbors = list(G.neighbors(node))
            neighbor_communities = {comm_partition.get(nbr) for nbr in neighbors if nbr in comm_partition}
            if len(neighbor_communities) > 1:
                # Find bridging edge evidence
                evidences = []
                for nbr in neighbors:
                    edge_data = G.get_edge_data(node, nbr) or {}
                    if edge_data.get("evidence"):
                        evidences.append(edge_data["evidence"])

                flagged_patterns.append({
                    "pattern_type": "BRIDGE_ENTITY",
                    "target_id": node,
                    "canonical_name": rdata["canonical_name"],
                    "betweenness_centrality": rdata["betweenness_centrality"],
                    "bridged_communities": list(neighbor_communities),
                    "evidence": evidences[0] if evidences else "network_adjacency"
                })

    # 2. Detect Shared-Resource Clusters
    for node in nodes:
        node_type = G.nodes[node].get("entity_type", "")
        degree = G.degree(node)
        if (node_type in ["phone", "account", "address", "resource"] or "PHONE" in node.upper() or "ACCOUNT" in node.upper()) and degree > 1:
            linked_entities = [nbr for nbr in G.neighbors(node)]
            evidences = []
            for nbr in linked_entities:
                edata = G.get_edge_data(node, nbr) or {}
                if edata.get("evidence"):
                    evidences.append(edata["evidence"])

            flagged_patterns.append({
                "pattern_type": "SHARED_RESOURCE_CLUSTER",
                "target_id": node,
                "resource_type": node_type or "resource",
                "linked_entities": linked_entities,
                "degree": degree,
                "evidence": evidences[0] if evidences else "shared_attribute_log"
            })

    # 3. Detect Unusually Dense Communities
    community_nodes: Dict[int, List[str]] = {}
    for node, comm_id in comm_partition.items():
        community_nodes.setdefault(comm_id, []).append(node)

    for comm_id, c_nodes in community_nodes.items():
        if len(c_nodes) >= 3:
            subgraph = G.subgraph(c_nodes)
            density = nx.density(subgraph)
            if density > 0.6:
                flagged_patterns.append({
                    "pattern_type": "DENSE_COMMUNITY",
                    "community_id": comm_id,
                    "member_count": len(c_nodes),
                    "density": round(density, 4),
                    "members": c_nodes
                })

    return {
        "node_risk": node_risk,
        "flagged_patterns": flagged_patterns,
        "high_risk_entities": high_risk_entities
    }
