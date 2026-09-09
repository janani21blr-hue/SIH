export const dashboardStats = {
  investigations: 24,
  entities: 186,
  relationships: 342,
  highRiskNetworks: 7,
}

export const entities = [
  {
    entity_id: "P042",
    entity_type: "person",
    canonical_name: "Rajesh Kumar",
    aliases: ["R. Kumar", "Raj Kumar"],
    attributes: {},
    confidence: 0.94,
  },
  {
    entity_id: "P017",
    entity_type: "person",
    canonical_name: "Amit Sharma",
    aliases: ["A. Sharma"],
    attributes: {},
    confidence: 0.91,
  },
  {
    entity_id: "PHONE_17",
    entity_type: "phone",
    canonical_name: "+91-9876543210",
    aliases: [],
    attributes: {},
    confidence: 0.98,
  },
]

export const relationships = [
  {
    source: "P042",
    target: "PHONE_17",
    relationship: "USES",
    confidence: 0.91,
    evidence: "investigation_record_17",
  },
  {
    source: "P017",
    target: "PHONE_17",
    relationship: "USES",
    confidence: 0.87,
    evidence: "investigation_record_21",
  },
]