"""
Pytest Test Suite for Entity Resolution Module (SIH26189).
Tests multi-signal resolution for positive and negative matching cases according to exact data contract specifications.
"""

import pytest
from entity_resolution import resolve_entities, CONFIDENCE_THRESHOLD


def test_positive_entity_resolution():
    """
    Positive case: "Rajesh Kumar", "R. Kumar", "Raj Kumar", "Rajesh K." sharing phone/address
    MUST resolve to ONE single entity.
    """
    input_records = [
        {
            "entity_id": "RAW_001",
            "entity_type": "person",
            "name": "Rajesh Kumar",
            "phone": "9876543210",
            "address": "123 MG Road, Connaught Place, New Delhi"
        },
        {
            "entity_id": "RAW_002",
            "entity_type": "person",
            "name": "R. Kumar",
            "phone": "9876543210",
            "address": "123 MG Road, Connaught Place, New Delhi"
        },
        {
            "entity_id": "RAW_003",
            "entity_type": "person",
            "name": "Raj Kumar",
            "phone": "9876543210",
            "address": "123 MG Road, Connaught Place, New Delhi"
        },
        {
            "entity_id": "RAW_004",
            "entity_type": "person",
            "name": "Rajesh K.",
            "phone": "9876543210",
            "address": "123 MG Road, Connaught Place, New Delhi"
        }
    ]

    resolved = resolve_entities(input_records)

    # Must resolve to exactly ONE entity
    assert len(resolved) == 1, f"Expected 1 resolved entity, got {len(resolved)}"

    merged_entity = resolved[0]
    
    # Data Contract verification
    assert merged_entity["entity_type"] == "person"
    assert merged_entity["canonical_name"] == "Rajesh Kumar"
    
    aliases = set(merged_entity["aliases"])
    assert "R. Kumar" in aliases
    assert "Raj Kumar" in aliases
    assert "Rajesh K." in aliases

    attributes = merged_entity["attributes"]
    assert "9876543210" in attributes.get("phones", [])
    assert merged_entity["confidence"] >= CONFIDENCE_THRESHOLD


def test_negative_entity_resolution():
    """
    Negative case: "Raj Kumar" vs "Raj Kapoor", zero shared attributes
    MUST remain TWO distinct entities.
    """
    input_records = [
        {
            "entity_id": "RAW_101",
            "entity_type": "person",
            "name": "Raj Kumar",
            "phone": "9876543210",
            "address": "123 MG Road, Connaught Place, New Delhi"
        },
        {
            "entity_id": "RAW_102",
            "entity_type": "person",
            "name": "Raj Kapoor",
            "phone": "1122334455",
            "address": "456 Park Street, Chowringhee, Kolkata"
        }
    ]

    resolved = resolve_entities(input_records)

    # Must remain TWO distinct entities
    assert len(resolved) == 2, f"Expected 2 distinct entities, got {len(resolved)}"

    names = {entity["canonical_name"] for entity in resolved}
    assert "Raj Kumar" in names
    assert "Raj Kapoor" in names


def test_household_different_first_names_negative_case():
    input_records = [
        {"entity_id": "RAW_201", "entity_type": "person", "name": "Priya Nair",
         "phone": "9876543210", "address": "123 MG Road, Connaught Place, New Delhi"},
        {"entity_id": "RAW_202", "entity_type": "person", "name": "Anil Nair",
         "phone": "9876543210", "address": "123 MG Road, Connaught Place, New Delhi"}
    ]
    resolved = resolve_entities(input_records)
    assert len(resolved) == 2, f"Expected 2 distinct entities, got {len(resolved)}"
    names = {entity["canonical_name"] for entity in resolved}
    assert "Priya Nair" in names
    assert "Anil Nair" in names



def test_entity_record_data_contract_schema():
    """
    Verifies that the output entity record strictly adheres to the data contract schema:
    {
      "entity_id": "P042",
      "entity_type": "person",
      "canonical_name": "Rajesh Kumar",
      "aliases": ["R. Kumar", "Raj Kumar"],
      "attributes": {},
      "confidence": 0.94
    }
    """
    record = {
        "entity_id": "P042",
        "entity_type": "person",
        "name": "Rajesh Kumar",
        "phone": "9999988888"
    }

    resolved = resolve_entities([record])
    assert len(resolved) == 1
    ent = resolved[0]

    required_keys = {"entity_id", "entity_type", "canonical_name", "aliases", "attributes", "confidence"}
    assert required_keys.issubset(set(ent.keys()))
    assert isinstance(ent["entity_id"], str)
    assert isinstance(ent["entity_type"], str)
    assert isinstance(ent["canonical_name"], str)
    assert isinstance(ent["aliases"], list)
    assert isinstance(ent["attributes"], dict)
    assert isinstance(ent["confidence"], float)

