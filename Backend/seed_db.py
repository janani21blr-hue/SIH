import json
import os
import sys

# Ensure Backend/app is on python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.database.connection import engine, Base, SessionLocal
from app.database.models import EntityModel, RelationshipModel, InvestigationModel

def seed():
    print("Creating all tables in SQLite database...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Clear existing entries to prevent duplication
        db.query(RelationshipModel).delete()
        db.query(EntityModel).delete()
        db.query(InvestigationModel).delete()
        db.commit()

        # 1. Seed from synthetic_dataset.json
        project_root = os.path.dirname(os.path.dirname(__file__))
        synthetic_path = os.path.join(project_root, "synthetic_dataset.json")
        mock_path = os.path.join(project_root, "mockData.json")

        entities_added = {}

        # Primary high-risk suspects from mockData.json
        if os.path.exists(mock_path):
            with open(mock_path, "r") as f:
                mock_data = json.load(f)
                for node in mock_data.get("nodes", []):
                    eid = node["entity_id"]
                    if eid not in entities_added:
                        ent = EntityModel(
                            entity_id=eid,
                            entity_type=node.get("entity_type", "person"),
                            canonical_name=node.get("canonical_name", eid),
                            aliases=node.get("aliases", []),
                            attributes=node.get("attributes", {}),
                            confidence=node.get("confidence", 0.95),
                        )
                        db.add(ent)
                        entities_added[eid] = True

                for link in mock_data.get("links", []):
                    rel = RelationshipModel(
                        source=link["source"],
                        target=link["target"],
                        relationship=link.get("relationship", "ASSOCIATED_WITH"),
                        confidence=link.get("confidence", 0.90),
                        evidence=link.get("evidence", "EVIDENCE_REF_001"),
                    )
                    db.add(rel)

        # Dataset from synthetic_dataset.json
        if os.path.exists(synthetic_path):
            with open(synthetic_path, "r") as f:
                synth_data = json.load(f)
                for raw in synth_data.get("raw_records", []):
                    eid = raw["entity_id"]
                    if eid not in entities_added:
                        ent = EntityModel(
                            entity_id=eid,
                            entity_type=raw.get("entity_type", "person"),
                            canonical_name=raw.get("name", eid),
                            aliases=[],
                            attributes={
                                "phone": raw.get("phone", ""),
                                "address": raw.get("address", ""),
                            },
                            confidence=0.92,
                        )
                        db.add(ent)
                        entities_added[eid] = True

                for raw_rel in synth_data.get("raw_relationships", []):
                    rel = RelationshipModel(
                        source=raw_rel["source"],
                        target=raw_rel["target"],
                        relationship=raw_rel.get("relationship", "CONNECTED_TO"),
                        confidence=raw_rel.get("confidence", 0.88),
                        evidence=raw_rel.get("evidence", "SYNTH_LOG_REF"),
                    )
                    db.add(rel)

        # 2. Seed active investigations
        investigations = [
            InvestigationModel(
                investigation_id="INV-2026-001",
                title="Operation Nexus: Hawala Financial Channel Disruption",
                description="Cross-border money laundering ring utilizing shell telecom SIMs and mule corporate directorships.",
                status="ACTIVE",
                risk_score=0.94,
            ),
            InvestigationModel(
                investigation_id="INV-2026-002",
                title="Syndicate Logistics & Toll ANPR Movement Tracking",
                description="Fleet of suspect commercial vehicles operating unauthorized transit corridors in Haryana and Delhi NCR.",
                status="ACTIVE",
                risk_score=0.84,
            ),
            InvestigationModel(
                investigation_id="INV-2026-003",
                title="Corporate Front Shell Companies MCA Registry Audit",
                description="Dormant companies activated with identical registered office addresses sharing bank signatory credentials.",
                status="UNDER_REVIEW",
                risk_score=0.76,
            ),
        ]
        for inv in investigations:
            db.add(inv)

        db.commit()

        total_entities = db.query(EntityModel).count()
        total_rels = db.query(RelationshipModel).count()
        total_invs = db.query(InvestigationModel).count()
        print(f"Database seeded successfully!")
        print(f"Entities: {total_entities}")
        print(f"Relationships: {total_rels}")
        print(f"Investigations: {total_invs}")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
