import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

type Entity = {
  entity_id: string;
  entity_type: string;
  canonical_name: string;
  aliases: string[];
  attributes: Record<string, string>;
  confidence: number;
};

type Explanation = {
  title: string;
  summary: string;
  findings: string[];
  evidence: string[];
};

const entity: Entity = {
  entity_id: "P042",
  entity_type: "person",
  canonical_name: "Rajesh Kumar",
  aliases: ["R. Kumar", "Raj Kumar"],
  attributes: {
    phone: "+91 9876543210",
    address: "Delhi",
    bank_account: "BANK_017",
    vehicle: "DL01AB1234",
  },
  confidence: 0.94,
};

const explanation: Explanation = {
  title: "Why this network was flagged",
  summary:
    "The entity appears structurally significant because it connects multiple entities through shared resources and relationships.",
  findings: [
    "Entity is connected to multiple investigation records.",
    "A shared bank account links this entity with several other entities.",
    "The entity acts as a bridge between two separate network clusters.",
    "Several relationships have high confidence scores.",
  ],
  evidence: [
    "CDR_LOG_101",
    "BANK_RECORD_017",
    "CASE_FILE_042",
    "VEHICLE_RECORD_008",
  ],
};

const riskData = [
  { category: "Low", count: 18 },
  { category: "Medium", count: 27 },
  { category: "High", count: 14 },
  { category: "Critical", count: 6 },
];

const timelineData = [
  { date: "Jan", events: 4 },
  { date: "Feb", events: 7 },
  { date: "Mar", events: 5 },
  { date: "Apr", events: 11 },
  { date: "May", events: 8 },
  { date: "Jun", events: 15 },
];

function App() {
  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>Criminal Network Analysis</h1>
          <p>AI-powered investigation intelligence dashboard</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Analysis Ready
        </div>
      </header>

      {/* MAIN */}
      <main className="dashboard">

        {/* ENTITY PROFILE */}
        <section className="card entity-card">
          <div className="section-title">
            <div>
              <h2>Entity Profile</h2>
              <p>Resolved entity information</p>
            </div>

            <span className="entity-type">
              {entity.entity_type}
            </span>
          </div>

          <div className="entity-main">
            <div className="avatar">
              {entity.canonical_name.charAt(0)}
            </div>

            <div>
              <h3>{entity.canonical_name}</h3>
              <p className="entity-id">{entity.entity_id}</p>
            </div>
          </div>

          <div className="confidence">
            <div className="confidence-header">
              <span>Resolution Confidence</span>
              <strong>{Math.round(entity.confidence * 100)}%</strong>
            </div>

            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${entity.confidence * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="details">

            <div className="detail-block">
              <h4>Aliases</h4>

              <div className="tags">
                {entity.aliases.map((alias) => (
                  <span className="tag" key={alias}>
                    {alias}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h4>Attributes</h4>

              <div className="attribute-grid">
                {Object.entries(entity.attributes).map(
                  ([key, value]) => (
                    <div className="attribute" key={key}>
                      <span>{key.replace("_", " ")}</span>
                      <strong>{value}</strong>
                    </div>
                  )
                )}
              </div>
            </div>

          </div>
        </section>

        {/* EXPLANATION PANEL */}
        <section className="card explanation-card">

          <div className="section-title">
            <div>
              <h2>Explain This Network</h2>
              <p>Evidence-linked investigation rationale</p>
            </div>

            <span className="signal-badge">
              Investigation Signal
            </span>
          </div>

          <div className="explanation-box">
            <h3>{explanation.title}</h3>
            <p>{explanation.summary}</p>
          </div>

          <div className="findings">
            <h3>Key Findings</h3>

            {explanation.findings.map((finding, index) => (
              <div className="finding" key={index}>
                <span className="finding-number">
                  {index + 1}
                </span>

                <p>{finding}</p>
              </div>
            ))}
          </div>

          <div className="evidence">
            <h3>Evidence Sources</h3>

            <div className="evidence-list">
              {explanation.evidence.map((item) => (
                <span className="evidence-item" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="disclaimer">
            ⚠ This analysis is an investigative signal only and does
            not establish guilt.
          </div>

        </section>

        {/* RISK DISTRIBUTION */}
        <section className="card chart-card">

          <div className="section-title">
            <div>
              <h2>Risk Distribution</h2>
              <p>Entities grouped by calculated risk level</p>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="category" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </section>

        {/* TIMELINE */}
        <section className="card chart-card">

          <div className="section-title">
            <div>
              <h2>Investigation Timeline</h2>
              <p>Relationship activity over time</p>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="events"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </section>

        {/* NETWORK STATISTICS */}
        <section className="stats">

          <div className="stat-card">
            <span>Total Entities</span>
            <strong>65</strong>
            <small>Resolved entities</small>
          </div>

          <div className="stat-card">
            <span>Relationships</span>
            <strong>134</strong>
            <small>Known connections</small>
          </div>

          <div className="stat-card">
            <span>Communities</span>
            <strong>8</strong>
            <small>Detected clusters</small>
          </div>

          <div className="stat-card">
            <span>Flagged Patterns</span>
            <strong>12</strong>
            <small>Requires investigation</small>
          </div>

        </section>

      </main>

      <footer>
        Criminal Network Analysis System • Evidence-driven intelligence
      </footer>

    </div>
  );
}

export default App;