"""
generate_dataset_v3.py — SIH26189, Backend #3
=================================================

Generates synthetic_dataset.json matching Janani's exact schema request:

  raw_records:      {entity_id, entity_type, name, phone, address}
  raw_relationships: {source, target, relationship, confidence, evidence}

Every raw_record uses the SAME 5 keys regardless of entity_type (person
or company) so downstream code can process the list without branching
on type or hitting KeyErrors.

Plants exactly what she asked for, and ties them together so a single
dataset covers both named scenarios:

  A) Shell-company scenario   — 1 controller (person) + 4 companies,
     3 of which share a registered address; controller is DIRECTOR_OF
     all 4. (entity_type: "company")

  B) Shared-resource ring     — 5 persons all USE the same bank
     account (the "mule account" scenario + checklist item 1).

  C) Dense community cluster  — 5 persons richly interconnected via
     TRANSACTED_WITH edges (checklist item 3).

  D) Bridge entity            — 1 person with exactly 2 edges: one
     into the mule-account ring (B), one into the dense cluster (C).
     Otherwise B and C share no connection, so this entity is the
     only path between them -> high betweenness centrality
     (checklist item 2).

  Plus background noise persons/edges to reach ~100 total raw_records.

A companion ground_truth_scenarios.json documents exactly which IDs
belong to which planted structure, for your own verification — this
file is NOT meant to be loaded into the pipeline, only for your checks.

Run: python3 generate_dataset_v3.py
"""

import json
import random

random.seed(7)

FIRST_NAMES = ["Arjun", "Priya", "Vikram", "Sneha", "Karthik", "Ananya",
               "Rohan", "Divya", "Suresh", "Meera", "Aditya", "Kavya",
               "Manoj", "Pooja", "Ravi", "Lakshmi", "Nikhil", "Shreya",
               "Farhan", "Neha", "Sameer", "Anjali", "Rahul", "Ishita"]
LAST_NAMES = ["Sharma", "Reddy", "Nair", "Gowda", "Iyer", "Patel",
              "Menon", "Rao", "Kulkarni", "Bhat", "Shetty", "Pillai"]
CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata",
          "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]
COMPANY_WORDS = ["Trading", "Logistics", "Ventures", "Enterprises",
                 "Infra", "Exports", "Holdings", "Consultancy", "Traders"]

_used_names = set()
_used_companies = set()

raw_records = []
raw_relationships = []
_id_counter = 0


def next_entity_id():
    global _id_counter
    _id_counter += 1
    return f"RAW_{_id_counter:03d}"


def add_record(entity_type, name, phone, address):
    rec = {
        "entity_id": next_entity_id(),
        "entity_type": entity_type,
        "name": name,
        "phone": phone,
        "address": address,
    }
    raw_records.append(rec)
    return rec["entity_id"]


def add_relationship(source, target, relationship, confidence, evidence):
    raw_relationships.append({
        "source": source,
        "target": target,
        "relationship": relationship,
        "confidence": confidence,
        "evidence": evidence,
    })


def random_name():
    while True:
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        if name not in _used_names:
            _used_names.add(name)
            return name


def random_phone():
    return f"{random.randint(7000000000, 9999999999)}"


def random_company_name():
    while True:
        name = f"{random.choice(LAST_NAMES)} {random.choice(COMPANY_WORDS)} Pvt Ltd"
        if name not in _used_companies:
            _used_companies.add(name)
            return name


ground_truth = {}

# ---------------------------------------------------------------------------
# A) Shell-company scenario: controller + 4 companies, 3 sharing an address
# ---------------------------------------------------------------------------

controller_name = random_name()
controller_phone = random_phone()
controller_addr = random.choice(CITIES)
controller_id = add_record("person", controller_name, controller_phone, controller_addr)

shared_company_address = random.choice([c for c in CITIES if c != controller_addr])
shell_company_ids = []
for i in range(4):
    company_name = random_company_name()
    addr = shared_company_address if i < 3 else random.choice(CITIES)
    company_id = add_record("company", company_name, random_phone(), addr)
    shell_company_ids.append(company_id)
    add_relationship(controller_id, company_id, "DIRECTOR_OF", round(random.uniform(0.85, 0.97), 2),
                      f"COMPANY_REGISTRY_{company_id}")

ground_truth["shell_company_scenario"] = {
    "controller_id": controller_id,
    "controller_name": controller_name,
    "company_ids": shell_company_ids,
    "shared_address": shared_company_address,
    "note": "3 of 4 companies share an address; controller directs all 4",
}

# ---------------------------------------------------------------------------
# B) Shared-resource ring (mule-account scenario): 5 persons, 1 bank account
# ---------------------------------------------------------------------------

shared_account_id = f"ACCT_{random.randint(10000000, 99999999)}"
mule_ring_ids = []
for _ in range(5):
    name = random_name()
    pid = add_record("person", name, random_phone(), random.choice(CITIES))
    mule_ring_ids.append(pid)
    add_relationship(pid, shared_account_id, "USES", round(random.uniform(0.88, 0.99), 2),
                      f"BANK_STATEMENT_{pid}")

ground_truth["mule_account_scenario"] = {
    "shared_account_id": shared_account_id,
    "member_ids": mule_ring_ids,
    "note": "all 5 persons transact through the same bank account",
}

# ---------------------------------------------------------------------------
# C) Dense community cluster: 5 persons, richly interconnected
# ---------------------------------------------------------------------------

dense_cluster_ids = []
for _ in range(5):
    name = random_name()
    pid = add_record("person", name, random_phone(), random.choice(CITIES))
    dense_cluster_ids.append(pid)

# connect most pairs within the cluster (dense, not necessarily complete)
for i in range(len(dense_cluster_ids)):
    for j in range(i + 1, len(dense_cluster_ids)):
        if random.random() < 0.8:  # ~80% of possible pairs connected -> dense
            add_relationship(dense_cluster_ids[i], dense_cluster_ids[j], "TRANSACTED_WITH",
                              round(random.uniform(0.75, 0.95), 2),
                              f"CDR_LOG_{dense_cluster_ids[i]}_{dense_cluster_ids[j]}")

ground_truth["dense_cluster_scenario"] = {
    "member_ids": dense_cluster_ids,
    "note": "~80% of all possible pairs connected -> should form one detected community",
}

# ---------------------------------------------------------------------------
# D) Bridge entity: connects the mule ring (B) to the dense cluster (C),
#    and nothing else -> the only path between the two components
# ---------------------------------------------------------------------------

bridge_name = random_name()
bridge_id = add_record("person", bridge_name, random_phone(), random.choice(CITIES))
add_relationship(bridge_id, random.choice(mule_ring_ids), "KNOWS", round(random.uniform(0.7, 0.85), 2),
                  f"SOCMINT_{bridge_id}")
add_relationship(bridge_id, random.choice(dense_cluster_ids), "KNOWS", round(random.uniform(0.7, 0.85), 2),
                  f"SOCMINT_{bridge_id}")

ground_truth["bridge_entity_scenario"] = {
    "bridge_id": bridge_id,
    "bridge_name": bridge_name,
    "connects": ["mule_account_scenario", "dense_cluster_scenario"],
    "note": "only entity with edges into both B and C -> should score highest betweenness centrality",
}

# ---------------------------------------------------------------------------
# Background noise -> pad out to ~100 total raw_records
# ---------------------------------------------------------------------------

TARGET_TOTAL_RECORDS = 100
background_ids = []
while len(raw_records) < TARGET_TOTAL_RECORDS:
    name = random_name()
    pid = add_record("person", name, random_phone(), random.choice(CITIES))
    background_ids.append(pid)

# sprinkle a few random, unremarkable relationships among background people
# (realistic noise, no planted structure)
for _ in range(15):
    a, b = random.sample(background_ids, 2)
    add_relationship(a, b, random.choice(["KNOWS", "CALLED"]), round(random.uniform(0.5, 0.8), 2),
                      f"CDR_LOG_{a}_{b}")

ground_truth["background_count"] = len(background_ids)

# ---------------------------------------------------------------------------
# Write outputs
# ---------------------------------------------------------------------------

synthetic_dataset = {
    "raw_records": raw_records,
    "raw_relationships": raw_relationships,
}

json.dump(synthetic_dataset, open("synthetic_dataset.json", "w"), indent=2)
json.dump(ground_truth, open("ground_truth_scenarios.json", "w"), indent=2)

print(f"raw_records: {len(raw_records)}")
print(f"raw_relationships: {len(raw_relationships)}")
print(f"\nShell-company controller: {controller_id} ({controller_name}) -> companies {shell_company_ids}")
print(f"Mule-account ring: {mule_ring_ids} -> shared account {shared_account_id}")
print(f"Dense cluster: {dense_cluster_ids}")
print(f"Bridge entity: {bridge_id} ({bridge_name}) connecting mule ring <-> dense cluster")
