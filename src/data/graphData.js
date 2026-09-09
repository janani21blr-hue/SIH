import mockData from "../../mockData.json";
import syntheticDataset from "../../synthetic_dataset.json";

export const ENTITY_TYPES = {
  PERSON: "person",
  PHONE: "phone",
  ACCOUNT: "account",
  VEHICLE: "vehicle",
  COMPANY: "company",
  ADDRESS: "address",
};

/*
 * Convert an entity from the SIH JSON contract into the
 * format consumed by React Force Graph.
 */
function createNode(entity) {
  return {
    id: entity.entity_id,
    entity_type: entity.entity_type,
    canonical_name: entity.canonical_name || entity.name,
    aliases: entity.aliases || [],
    attributes: entity.attributes || {},
    confidence: entity.confidence ?? 0,
    label: entity.canonical_name || entity.name || entity.entity_id,
  };
}

/*
 * Convert a relationship from the SIH JSON contract.
 */
function createLink(relationship) {
  return {
    source: relationship.source,
    target: relationship.target,
    relationship: relationship.relationship,
    confidence: relationship.confidence ?? 0,
    evidence: relationship.evidence || null,
  };
}

/*
 * ---------------------------------------------------------
 * RICH DATASET
 * ---------------------------------------------------------
 */

const baseNodes = (
  syntheticDataset?.raw_records?.length
    ? syntheticDataset.raw_records
    : mockData.nodes || []
).map(createNode);

const baseLinks = (
  syntheticDataset?.raw_relationships?.length
    ? syntheticDataset.raw_relationships
    : mockData.links || []
).map(createLink);

/*
 * ---------------------------------------------------------
 * FRONTEND DEMO EXTENSION
 * ---------------------------------------------------------
 *
 * These records are only for demonstrating the investigation
 * workflow before the real backend is connected.
 *
 * They follow the same SIH entity/relationship schema.
 */

const demoNodes = [
  {
    entity_id: "P017",
    entity_type: "person",
    canonical_name: "Anil Sharma",
    aliases: ["A. Sharma"],
    attributes: {
      location: "Delhi",
    },
    confidence: 0.91,
  },

  {
    entity_id: "P031",
    entity_type: "person",
    canonical_name: "Vikram Singh",
    aliases: ["V. Singh"],
    attributes: {
      location: "Gurgaon",
    },
    confidence: 0.89,
  },

  {
    entity_id: "PHONE_08",
    entity_type: "phone",
    canonical_name: "+91 9811122233",
    aliases: [],
    attributes: {
      provider: "Jio",
    },
    confidence: 0.97,
  },

  {
    entity_id: "PHONE_21",
    entity_type: "phone",
    canonical_name: "+91 9898989898",
    aliases: [],
    attributes: {
      provider: "Airtel",
    },
    confidence: 0.95,
  },

  {
    entity_id: "ACC_12",
    entity_type: "account",
    canonical_name: "Account •••• 4821",
    aliases: [],
    attributes: {
      bank: "Demo Bank",
    },
    confidence: 0.93,
  },

  {
    entity_id: "ACC_19",
    entity_type: "account",
    canonical_name: "Account •••• 7714",
    aliases: [],
    attributes: {
      bank: "Demo Bank",
    },
    confidence: 0.9,
  },

  {
    entity_id: "VEH_07",
    entity_type: "vehicle",
    canonical_name: "DL 3C AB 4821",
    aliases: [],
    attributes: {
      category: "SUV",
    },
    confidence: 0.86,
  },

  {
    entity_id: "COMP_12",
    entity_type: "company",
    canonical_name: "North Star Trading",
    aliases: ["North Star"],
    attributes: {
      registration: "DEMO-COMP-12",
    },
    confidence: 0.88,
  },

  {
    entity_id: "ADDR_04",
    entity_type: "address",
    canonical_name: "Sector 18, Gurgaon",
    aliases: [],
    attributes: {
      city: "Gurgaon",
    },
    confidence: 0.84,
  },

  {
    entity_id: "ADDR_09",
    entity_type: "address",
    canonical_name: "Connaught Place, Delhi",
    aliases: ["CP Delhi"],
    attributes: {
      city: "Delhi",
    },
    confidence: 0.9,
  },
];

const demoLinks = [
  {
    source: "P017",
    target: "PHONE_08",
    relationship: "USES",
    confidence: 0.94,
    evidence: "demo_phone_record_08",
  },

  {
    source: "P017",
    target: "ACC_12",
    relationship: "OWNS",
    confidence: 0.89,
    evidence: "demo_account_record_12",
  },

  {
    source: "P017",
    target: "VEH_07",
    relationship: "USES",
    confidence: 0.86,
    evidence: "demo_vehicle_record_07",
  },

  {
    source: "P017",
    target: "ADDR_04",
    relationship: "ASSOCIATED_WITH",
    confidence: 0.82,
    evidence: "demo_address_record_04",
  },

  {
    source: "P031",
    target: "PHONE_21",
    relationship: "USES",
    confidence: 0.92,
    evidence: "demo_phone_record_21",
  },

  {
    source: "P031",
    target: "ACC_19",
    relationship: "OWNS",
    confidence: 0.87,
    evidence: "demo_account_record_19",
  },

  {
    source: "P031",
    target: "COMP_12",
    relationship: "DIRECTOR_OF",
    confidence: 0.9,
    evidence: "demo_company_record_12",
  },

  {
    source: "P031",
    target: "ADDR_04",
    relationship: "ASSOCIATED_WITH",
    confidence: 0.79,
    evidence: "demo_address_record_04",
  },

  {
    source: "COMP_12",
    target: "ADDR_09",
    relationship: "REGISTERED_AT",
    confidence: 0.91,
    evidence: "demo_company_address_09",
  },

  {
    source: "P042",
    target: "ADDR_09",
    relationship: "ASSOCIATED_WITH",
    confidence: 0.83,
    evidence: "demo_address_record_09",
  },

  {
    source: "COMP_05",
    target: "ADDR_09",
    relationship: "REGISTERED_AT",
    confidence: 0.88,
    evidence: "demo_company_address_09",
  },
];

/*
 * ---------------------------------------------------------
 * FINAL INVESTIGATION GRAPH
 * ---------------------------------------------------------
 */

export const graphNodes = [
  ...baseNodes,
  ...demoNodes.map(createNode),
];

export const graphLinks = [
  ...baseLinks,
  ...demoLinks.map(createLink),
];

export const investigationGraph = {
  nodes: graphNodes,
  links: graphLinks,
};

/*
 * ---------------------------------------------------------
 * HELPER FUNCTIONS
 * ---------------------------------------------------------
 */

export function getEntityById(entityId) {
  return graphNodes.find(
    (node) => node.id === entityId
  );
}

export function getRelationshipsForEntity(entityId) {
  return graphLinks.filter((link) => {
    const sourceId =
      typeof link.source === "object"
        ? link.source.id
        : link.source;

    const targetId =
      typeof link.target === "object"
        ? link.target.id
        : link.target;

    return (
      sourceId === entityId ||
      targetId === entityId
    );
  });
}

export function filterNodesByType(entityType) {
  return graphNodes.filter(
    (node) => node.entity_type === entityType
  );
}