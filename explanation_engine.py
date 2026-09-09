"""
Explanation Engine Module for AI-Powered Criminal Network Analysis System (SIH26189).
Generates deterministic, template-based plain-language explanations for flagged risk entities and clusters.

Strict Constraints:
- NO LLM-based text generation or non-deterministic prompt output.
- All explanations use fixed python templates and strictly cite exact graph properties and evidence.
"""

from typing import List, Dict, Any

# Fixed templates citing specific graph properties and evidence
TEMPLATE_BRIDGE_ENTITY = (
    "Entity '{canonical_name}' ({target_id}) flagged for betweenness centrality of {betweenness_centrality:.2f}, "
    "bridging communities {bridged_communities_str} (evidence: {evidence})."
)

TEMPLATE_SHARED_RESOURCE = (
    "Resource '{target_id}' ({resource_type}) flagged as shared-resource cluster linking {degree} entities "
    "({linked_entities_str}) (evidence: {evidence})."
)

TEMPLATE_DENSE_COMMUNITY = (
    "Community '{community_id}' flagged for unusually dense internal connections with edge density of {density:.2f}, "
    "containing {member_count} member entities ({members_str})."
)

TEMPLATE_HIGH_RISK_ENTITY = (
    "Entity '{canonical_name}' ({entity_id}) flagged as {risk_level} risk with normalized score of {risk_score:.2f} "
    "(betweenness Z-score: {z_betweenness:.2f}, degree Z-score: {z_degree:.2f})."
)


def generate_explanations(risk_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Takes flagged patterns and high-risk entities from risk_engine and formats
    plain-language explanations strictly using predefined template strings.
    """
    explanations: List[Dict[str, Any]] = []
    flagged_patterns = risk_analysis.get("flagged_patterns", [])
    node_risk = risk_analysis.get("node_risk", {})

    # Process flagged risk patterns
    for pattern in flagged_patterns:
        p_type = pattern.get("pattern_type")

        if p_type == "BRIDGE_ENTITY":
            target_id = pattern["target_id"]
            name = pattern.get("canonical_name", target_id)
            bet = pattern.get("betweenness_centrality", 0.0)
            comms = pattern.get("bridged_communities", [])
            evidence = pattern.get("evidence", "network_adjacency")
            comms_str = ", ".join(f"Cluster-{c}" for c in comms)

            text = TEMPLATE_BRIDGE_ENTITY.format(
                canonical_name=name,
                target_id=target_id,
                betweenness_centrality=bet,
                bridged_communities_str=comms_str,
                evidence=evidence
            )
            explanations.append({
                "flag_type": p_type,
                "target_id": target_id,
                "explanation": text,
                "cited_metrics": {
                    "betweenness_centrality": bet,
                    "bridged_communities": comms,
                    "evidence": evidence
                }
            })

        elif p_type == "SHARED_RESOURCE_CLUSTER":
            target_id = pattern["target_id"]
            res_type = pattern.get("resource_type", "resource")
            degree = pattern.get("degree", 0)
            linked = pattern.get("linked_entities", [])
            evidence = pattern.get("evidence", "shared_attribute_log")
            linked_str = ", ".join(linked)

            text = TEMPLATE_SHARED_RESOURCE.format(
                target_id=target_id,
                resource_type=res_type,
                degree=degree,
                linked_entities_str=linked_str,
                evidence=evidence
            )
            explanations.append({
                "flag_type": p_type,
                "target_id": target_id,
                "explanation": text,
                "cited_metrics": {
                    "degree": degree,
                    "linked_entities": linked,
                    "evidence": evidence
                }
            })

        elif p_type == "DENSE_COMMUNITY":
            comm_id = pattern["community_id"]
            density = pattern.get("density", 0.0)
            m_count = pattern.get("member_count", 0)
            members = pattern.get("members", [])
            members_str = ", ".join(members)

            text = TEMPLATE_DENSE_COMMUNITY.format(
                community_id=comm_id,
                density=density,
                member_count=m_count,
                members_str=members_str
            )
            explanations.append({
                "flag_type": p_type,
                "target_id": f"Community_{comm_id}",
                "explanation": text,
                "cited_metrics": {
                    "community_id": comm_id,
                    "density": density,
                    "member_count": m_count
                }
            })

    # Process high-risk individual entities
    for node_id, rdata in node_risk.items():
        if rdata.get("risk_level") in ["CRITICAL", "HIGH"]:
            name = rdata.get("canonical_name", node_id)
            score = rdata.get("risk_score", 0.0)
            risk_lvl = rdata.get("risk_level", "HIGH")
            z_bet = rdata.get("z_betweenness", 0.0)
            z_deg = rdata.get("z_degree", 0.0)

            text = TEMPLATE_HIGH_RISK_ENTITY.format(
                canonical_name=name,
                entity_id=node_id,
                risk_level=risk_lvl,
                risk_score=score,
                z_betweenness=z_bet,
                z_degree=z_deg
            )
            explanations.append({
                "flag_type": "HIGH_RISK_ENTITY",
                "target_id": node_id,
                "explanation": text,
                "cited_metrics": {
                    "risk_score": score,
                    "risk_level": risk_lvl,
                    "z_betweenness": z_bet,
                    "z_degree": z_deg
                }
            })

    return explanations
