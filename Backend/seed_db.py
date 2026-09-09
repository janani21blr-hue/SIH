import json
import os
import sys
import random

# Ensure Backend is on python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.database.connection import engine, Base, SessionLocal
from app.database.models import EntityModel, RelationshipModel, InvestigationModel

random.seed(42)

CITY_HUBS = {
    "Delhi": "Delhi NCR Investigation Corridor",
    "Mumbai": "BKC Financial Hub, Mumbai",
    "Bengaluru": "Koramangala Commercial Hub, Bengaluru",
    "Chennai": "Anna Salai Business Belt, Chennai",
    "Kolkata": "Salt Lake Sector V, Kolkata",
    "Hyderabad": "HITEC City Logistics Corridor, Hyderabad",
    "Pune": "Hinjawadi Commercial Park, Pune",
    "Ahmedabad": "Ellis Bridge Transit Hub, Ahmedabad",
    "Jaipur": "MI Road Financial District, Jaipur",
    "Lucknow": "Hazratganj Central District, Lucknow",
}

CITY_PLATES = {
    "Ahmedabad": "GJ 01",
    "Delhi": "DL 01",
    "Mumbai": "MH 01",
    "Bengaluru": "KA 01",
    "Chennai": "TN 01",
    "Kolkata": "WB 01",
    "Hyderabad": "TS 01",
    "Pune": "MH 12",
    "Jaipur": "RJ 14",
    "Lucknow": "UP 32",
}

def seed():
    print("Creating all tables in SQLite database...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Clear existing entries
        db.query(RelationshipModel).delete()
        db.query(EntityModel).delete()
        db.query(InvestigationModel).delete()
        db.commit()

        project_root = os.path.dirname(os.path.dirname(__file__))
        synthetic_path = os.path.join(project_root, "synthetic_dataset.json")

        entities_dict = {}
        relationships_list = []

        def add_entity(entity_id, entity_type, canonical_name, aliases=None, attributes=None, confidence=0.92):
            if entity_id in entities_dict:
                return
            attrs = dict(attributes or {})
            if "risk_score" in attrs:
                risk = float(attrs["risk_score"])
            else:
                risk = round(max(0.05, min(0.95, 1.0 - confidence)), 2)
            attrs["risk_score"] = risk
            ent = EntityModel(
                entity_id=entity_id,
                entity_type=entity_type,
                canonical_name=canonical_name,
                aliases=aliases or [],
                attributes=attrs,
                confidence=confidence,
            )
            entities_dict[entity_id] = ent
            db.add(ent)

        def add_relationship(source, target, relationship, confidence=0.88, evidence=""):
            relationships_list.append((source, target, relationship, confidence, evidence))

        # 2. Demo rich graph records (phones, accounts, vehicles, addresses)
        demo_nodes = [
            ("P017", "person", "Anil Sharma", ["A. Sharma"], {"location": "Delhi", "risk_score": 0.09}, 0.91),
            ("P031", "person", "Vikram Singh", ["V. Singh"], {"location": "Gurgaon", "risk_score": 0.11}, 0.89),
            ("PHONE_08", "phone", "+91 9811122233", [], {"provider": "Jio", "circle": "Delhi"}, 0.97),
            ("PHONE_21", "phone", "+91 9898989898", [], {"provider": "Airtel", "circle": "Haryana"}, 0.95),
            ("ACC_12", "account", "HDFC Bank •••• 4821", [], {"bank": "HDFC Bank", "type": "Current"}, 0.93),
            ("ACC_19", "account", "ICICI Bank •••• 7714", [], {"bank": "ICICI Bank", "type": "Savings"}, 0.90),
            ("VEH_07", "vehicle", "DL 3C AB 4821", [], {"category": "SUV", "owner": "Anil Sharma"}, 0.86),
            ("COMP_12", "company", "North Star Trading Pvt Ltd", ["North Star"], {"registration": "DEMO-COMP-12"}, 0.88),
            ("ADDR_04", "address", "Sector 18, Gurgaon Hub", [], {"city": "Gurgaon"}, 0.84),
            ("ADDR_09", "address", "Connaught Place, Delhi Hub", ["CP Delhi"], {"city": "Delhi"}, 0.90),
        ]
        for eid, etype, name, aliases, attrs, conf in demo_nodes:
            add_entity(eid, etype, name, aliases, attrs, conf)

        demo_links = [
            ("P017", "PHONE_08", "USES", 0.94, "TELECOM_CDR_LOG_P017"),
            ("P017", "ACC_12", "OWNS", 0.89, "BANK_STATEMENT_P017"),
            ("P017", "VEH_07", "USES", 0.86, "ANPR_TOLL_RECORD_P017"),
            ("P017", "ADDR_04", "ASSOCIATED_WITH", 0.82, "RESIDENCE_RECORD_P017"),
            ("P031", "PHONE_21", "USES", 0.92, "TELECOM_CDR_LOG_P031"),
            ("P031", "ACC_19", "OWNS", 0.87, "BANK_STATEMENT_P031"),
            ("P031", "COMP_12", "DIRECTOR_OF", 0.90, "MCA_REGISTRY_P031"),
            ("P031", "ADDR_04", "ASSOCIATED_WITH", 0.79, "RESIDENCE_RECORD_P031"),
            ("COMP_12", "ADDR_09", "REGISTERED_AT", 0.91, "MCA_OFFICE_REGISTRY_COMP12"),
            ("P042", "ADDR_09", "ASSOCIATED_WITH", 0.83, "OFFICE_LEASE_RECORD_P042"),
        ]
        for src, tgt, rel, conf, evid in demo_links:
            add_relationship(src, tgt, rel, conf, evid)

        # 3. Create all regional Address Hubs
        for city, hub_name in CITY_HUBS.items():
            addr_id = f"ADDR_{city}"
            add_entity(
                entity_id=addr_id,
                entity_type="address",
                canonical_name=hub_name,
                aliases=[f"{city} Central"],
                attributes={"city": city, "zone": "Investigation Regional Hub"},
                confidence=0.92,
            )

        # 4. Seed records from synthetic_dataset.json
        if os.path.exists(synthetic_path):
            with open(synthetic_path, "r") as f:
                synth_data = json.load(f)

            raw_records = synth_data.get("raw_records", [])

            # Add primary raw records (persons and companies)
            for raw in raw_records:
                eid = raw["entity_id"]
                etype = raw.get("entity_type", "person")
                name = raw.get("name", eid)
                phone_num = raw.get("phone", "")
                addr_city = raw.get("address", "")

                raw_attrs = dict(raw.get("attributes", {}))
                if phone_num:
                    raw_attrs["phone"] = phone_num
                if addr_city:
                    raw_attrs["address"] = addr_city

                add_entity(
                    entity_id=eid,
                    entity_type=etype,
                    canonical_name=name,
                    aliases=raw.get("aliases", []),
                    attributes=raw_attrs,
                    confidence=raw.get("confidence", 0.92),
                )

                # Connect Person / Company to their Phone Entity
                if phone_num:
                    phone_id = f"PHONE_{phone_num}"
                    add_entity(
                        entity_id=phone_id,
                        entity_type="phone",
                        canonical_name=f"+91 {phone_num}",
                        aliases=[],
                        attributes={
                            "provider": random.choice(["Jio", "Airtel", "Vi"]),
                            "circle": addr_city,
                            "sim_status": "Active",
                        },
                        confidence=0.96,
                    )
                    add_relationship(
                        source=eid,
                        target=phone_id,
                        relationship="USES",
                        confidence=0.95,
                        evidence=f"CDR_SUBSCRIBER_LOG_{eid}",
                    )

                # Connect Person / Company to their Location/Address Hub
                if addr_city and f"ADDR_{addr_city}" in entities_dict:
                    addr_target = f"ADDR_{addr_city}"
                    rel_type = "REGISTERED_AT" if etype == "company" else "LOCATED_AT"
                    add_relationship(
                        source=eid,
                        target=addr_target,
                        relationship=rel_type,
                        confidence=0.90,
                        evidence=f"GEO_LOCATION_RECORD_{eid}",
                    )

            # Bank Accounts
            # (A) Seed the planted Mule Ring Account
            mule_acct_id = "ACCT_94641177"
            add_entity(
                entity_id=mule_acct_id,
                entity_type="account",
                canonical_name="SBI •••• 1177 (Syndicate Mule Account)",
                aliases=["Mule Account #1177"],
                attributes={
                    "bank": "State Bank of India",
                    "branch": "Central Commercial Branch",
                    "flag": "High-Risk Shared Mule Account",
                    "reported_balance": "₹42,50,000",
                },
                confidence=0.98,
            )

            # (B) Create Bank Accounts for suspects and key entities (including Vikram Pillai RAW_065!)
            banks = ["HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Kotak Mahindra Bank"]
            for i, raw in enumerate(raw_records):
                eid = raw["entity_id"]
                # Guarantee bank accounts for Vikram Pillai and other suspects
                if i % 3 == 0 or eid == "RAW_065" or eid in ["RAW_006", "RAW_007", "RAW_008", "RAW_009", "RAW_010"]:
                    last4 = raw.get("phone", "1234")[-4:]
                    bank_choice = random.choice(banks)
                    acct_id = f"ACCT_{eid}"
                    add_entity(
                        entity_id=acct_id,
                        entity_type="account",
                        canonical_name=f"{bank_choice} •••• {last4}",
                        aliases=[],
                        attributes={
                            "bank": bank_choice,
                            "account_type": "Savings/Current",
                            "status": "Monitored",
                        },
                        confidence=0.93,
                    )
                    add_relationship(
                        source=eid,
                        target=acct_id,
                        relationship="OWNS",
                        confidence=0.94,
                        evidence=f"FINANCIAL_KYC_VERIFICATION_{eid}",
                    )

            # Vehicles for transport / mobility suspects (including Vikram Pillai RAW_065!)
            for i, raw in enumerate(raw_records):
                eid = raw["entity_id"]
                if i % 5 == 0 or eid == "RAW_065":
                    city = raw.get("address", "Delhi")
                    plate_prefix = CITY_PLATES.get(city, "DL 01")
                    last4 = raw.get("phone", "4321")[-4:]
                    veh_id = f"VEH_{eid}"
                    plate_number = f"{plate_prefix} AB {last4}"
                    add_entity(
                        entity_id=veh_id,
                        entity_type="vehicle",
                        canonical_name=plate_number,
                        aliases=[f"Vehicle {plate_number}"],
                        attributes={
                            "category": "Commercial Truck/SUV",
                            "toll_plaza_hit": "NH48 Toll Plaza",
                            "status": "ANPR Monitored",
                        },
                        confidence=0.91,
                    )
                    add_relationship(
                        source=eid,
                        target=veh_id,
                        relationship="USES",
                        confidence=0.90,
                        evidence=f"ANPR_SURVEILLANCE_CAMERA_{eid}",
                    )

            # Inter-suspect raw relationships from synthetic dataset
            for raw_rel in synth_data.get("raw_relationships", []):
                src = raw_rel["source"]
                tgt = raw_rel["target"]
                rel = raw_rel.get("relationship", "ASSOCIATED_WITH")
                conf = raw_rel.get("confidence", 0.88)
                evid = raw_rel.get("evidence", "SYNTH_LOG_REF")
                add_relationship(source=src, target=tgt, relationship=rel, confidence=conf, evidence=evid)

        # 4.5. Enforce connection degree rules: >7 connections -> elevated risk, inverse confidence
        from collections import Counter
        degrees = Counter()
        for src, tgt, _, _, _ in relationships_list:
            degrees[src] += 1
            degrees[tgt] += 1

        for eid, ent in entities_dict.items():
            deg = degrees[eid]
            attrs = dict(ent.attributes or {})
            if deg > 7:
                risk = attrs.get("risk_score", 0.85)
                if risk < 0.80:
                    risk = round(random.uniform(0.82, 0.95), 2)
                attrs["risk_score"] = risk
                ent.attributes = attrs
                ent.confidence = round(1.0 - risk, 2)
            else:
                risk = attrs.get("risk_score")
                if risk is None:
                    risk = round(random.uniform(0.10, 0.65), 2)
                attrs["risk_score"] = risk
                ent.attributes = attrs
                ent.confidence = round(1.0 - risk, 2)

        # 5. Insert all relationships, ensuring BOTH source and target exist
        valid_rels_count = 0
        for src, tgt, rel, conf, evid in relationships_list:
            if src in entities_dict and tgt in entities_dict:
                db_rel = RelationshipModel(
                    source=src,
                    target=tgt,
                    relationship=rel,
                    confidence=conf,
                    evidence=evid,
                )
                db.add(db_rel)
                valid_rels_count += 1
            else:
                # Log if anything was unresolvable
                pass

        # 6. Seed active investigations
        investigations = [
            InvestigationModel(
                investigation_id="INV-2026-001",
                title="Operation Nexus: Hawala Financial Channel Disruption",
                description="Cross-border money laundering ring utilizing shell telecom SIMs, mule accounts, and corporate directorships.",
                status="ACTIVE",
                risk_score=0.94,
            ),
            InvestigationModel(
                investigation_id="INV-2026-002",
                title="Syndicate Logistics & Toll ANPR Movement Tracking",
                description="Fleet of suspect commercial vehicles operating unauthorized transit corridors in Gujarat, Haryana and Delhi NCR.",
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
        print(f"Database seeded successfully with fully connected knowledge graph!")
        print(f"Entities: {total_entities}")
        print(f"Relationships: {total_rels}")
        print(f"Investigations: {total_invs}")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
