import { FileText, Download, ShieldAlert, CheckCircle2, Calendar, AlertTriangle } from "lucide-react"

const MOCK_REPORTS = [
  {
    id: "REP-2026-089",
    title: "Operation Nexus: Hawala Financial Channel Disruption",
    date: "Sep 08, 2026",
    classification: "TOP SECRET // LE ONLY",
    summary: "Complete financial flow tracing revealing 14 shell accounts linked to primary kingpin P042 and mule phone +91-9876543210.",
    risk: "CRITICAL",
    entitiesInvolved: 24,
    status: "Finalized",
  },
  {
    id: "REP-2026-084",
    title: "Syndicate Logistics & Cross-Border Vehicle Movement",
    date: "Sep 05, 2026",
    classification: "CONFIDENTIAL",
    summary: "Automated toll tag and ANPR tracking correlating suspect vehicles DL 3C AB 4821 with warehouse locations in Sector 18 Gurgaon.",
    risk: "HIGH",
    entitiesInvolved: 11,
    status: "Under Review",
  },
  {
    id: "REP-2026-077",
    title: "Corporate Front Entities MCA Registry Audit",
    date: "Aug 29, 2026",
    classification: "INTERNAL USE",
    summary: "Directorship mapping connecting Global Exports Ltd to multiple unlisted shell corporations sharing identical registered office addresses.",
    risk: "MEDIUM",
    entitiesInvolved: 8,
    status: "Actioned",
  },
]

function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Intelligence Reports & Briefings</h2>
          <p className="mt-1 text-sm muted-text">
            Official synthesized investigation briefings, threat scores, and evidence dossiers
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-500/20 transition">
          <FileText size={16} />
          <span>Generate New Dossier</span>
        </button>
      </div>

      <div className="grid gap-4">
        {MOCK_REPORTS.map((report) => (
          <div
            key={report.id}
            className="app-surface p-6 transition hover:border-slate-700"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-300">
                    {report.id}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                      report.risk === "CRITICAL"
                        ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                        : report.risk === "HIGH"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                    }`}
                  >
                    {report.risk} THREAT
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {report.classification}
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-semibold text-white">
                  {report.title}
                </h3>

                <p className="mt-1.5 text-sm text-slate-400 max-w-3xl">
                  {report.summary}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => alert(`Exporting report ${report.id} as PDF...`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-slate-800/80 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                {report.date}
              </span>
              <span>
                Entities Analyzed:{" "}
                <span className="font-semibold text-slate-300">
                  {report.entitiesInvolved} nodes
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Status: {report.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reports
