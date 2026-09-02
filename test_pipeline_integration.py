"""
Sanity check script to test end-to-end flow across:
entity_resolution -> graph_engine -> risk_engine -> explanation_engine
"""

from entity_resolution import resolve_entities
from graph_engine import build_graph, analyze_graph
from risk_engine import compute_risk_scores
from explanation_engine import generate_explanations


def run_pipeline_sanity_check():
    # 1. Mock raw investigation records
    raw_records = [
        {
            "entity_id": "RAW_001",
            "entity_type": "person",
            "name": "Rajesh Kumar",
            "phone": "9876543210",
            "address": "Delhi"
        },
        {
            "entity_id": "RAW_002",
            "entity_type": "person",
            "name": "R. Kumar",
            "phone": "9876543210",
            "address": "Delhi"
        },
        {
            "entity_id": "RAW_003",
            "entity_type": "person",
            "name": "Suresh Mehta",
            "phone": "1122334455",
            "address": "Mumbai"
        }
    ]

    # 2. Mock relationships referencing resolved and resource entities
    raw_relationships = [
        {
            "source": "P001",
            "target": "PHONE_9876543210",
            "relationship": "USES",
            "confidence": 0.95,
            "evidence": "CDR_LOG_101"
        },
        {
            "source": "P002",
            "target": "PHONE_9876543210",
            "relationship": "USES",
            "confidence": 0.90,
            "evidence": "CDR_LOG_102"
        }
    ]

    # Step A: Entity Resolution
    resolved = resolve_entities(raw_records)
    print(f"[1/4] Entity Resolution Completed: {len(resolved)} resolved entities.")

    # Step B: Graph Analytics
    graph = build_graph(resolved, raw_relationships)
    analytics = analyze_graph(graph)
    print(f"[2/4] Graph Construction Completed: {analytics['graph_summary']['nodes']} nodes, {analytics['graph_summary']['edges']} edges.")

    # Step C: Risk Scoring
    risk_output = compute_risk_scores(graph, analytics)
    print(f"[3/4] Risk Engine Completed: {len(risk_output['flagged_patterns'])} patterns flagged.")

    # Step D: Explanation Engine
    explanations = generate_explanations(risk_output)
    print(f"[4/4] Explanation Engine Completed: {len(explanations)} explanations generated.")

    print("\n--- SAMPLE GENERATED EXPLANATION ---")
    if explanations:
        print(explanations[0]["explanation"])
    else:
        print("No risk patterns triggered for this minimal graph.")


if __name__ == "__main__":
    run_pipeline_sanity_check()
