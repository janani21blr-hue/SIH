export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const investigations = [
    {
      investigation_id: "INV-2026-001",
      title: "Operation Nexus: Hawala Financial Channel Disruption",
      description: "Cross-border money laundering ring utilizing shell telecom SIMs, mule accounts, and corporate directorships.",
      status: "ACTIVE",
      risk_score: 0.94,
    },
    {
      investigation_id: "INV-2026-002",
      title: "Syndicate Logistics & Toll ANPR Movement Tracking",
      description: "Fleet of suspect commercial vehicles operating unauthorized transit corridors in Gujarat, Haryana and Delhi NCR.",
      status: "ACTIVE",
      risk_score: 0.84,
    },
    {
      investigation_id: "INV-2026-003",
      title: "Corporate Front Shell Companies MCA Registry Audit",
      description: "Dormant companies activated with identical registered office addresses sharing bank signatory credentials.",
      status: "UNDER_REVIEW",
      risk_score: 0.76,
    },
  ];

  return res.status(200).json(investigations);
}
