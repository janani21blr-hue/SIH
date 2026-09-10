import fs from "fs";
import path from "path";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const filePath = path.join(process.cwd(), "synthetic_dataset.json");
    const dataset = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const nodes = (dataset.raw_records || []).map((entity) => ({
      id: entity.entity_id,
      entity_id: entity.entity_id,
      entity_type: entity.entity_type,
      canonical_name: entity.canonical_name || entity.name || entity.entity_id,
      aliases: entity.aliases || [],
      attributes: entity.attributes || {},
      confidence: entity.confidence ?? 0.9,
    }));

    const edges = (dataset.raw_relationships || []).map((rel) => ({
      source: rel.source,
      target: rel.target,
      relationship: rel.relationship,
      confidence: rel.confidence ?? 0.88,
      evidence: rel.evidence || "",
    }));

    return res.status(200).json({
      nodes,
      edges,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load graph data", details: String(err) });
  }
}
