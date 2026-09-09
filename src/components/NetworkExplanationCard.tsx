import { AlertTriangle, FileSearch, ShieldCheck } from "lucide-react"

interface Explanation {
  title: string
  summary: string
  findings: string[]
  evidence: string[]
}

const defaultExplanation: Explanation = {
  title: "Why this network was flagged",
  summary:
    "The entity appears structurally significant because it connects multiple disparate suspect clusters through shared telecom identifiers and layered banking accounts.",
  findings: [
    "Entity is cross-referenced in 4 active syndicate investigation records.",
    "A shared bank account links this entity with several shell corporate director accounts.",
    "The entity acts as a central bridge between two distinct hawala routing sub-networks.",
    "Multiple relationships exhibit verified multi-source corroboration (>90% confidence).",
  ],
  evidence: [
    "CDR_LOG_101",
    "BANK_RECORD_017",
    "CASE_FILE_042",
    "VEHICLE_RECORD_008",
  ],
}

function NetworkExplanationCard({ explanation = defaultExplanation }: { explanation?: Explanation }) {
  return (
    <div className="space-y-4">
      <div className="explanation-box">
        <h4>{explanation.title}</h4>
        <p>{explanation.summary}</p>
      </div>

      <div>
        <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Key Investigative Findings
        </h5>
        <div className="space-y-2.5">
          {explanation.findings.map((finding, index) => (
            <div key={index} className="finding-row">
              <span className="finding-num">{index + 1}</span>
              <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{finding}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800/80 pt-3">
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Evidence Sources
        </h5>
        <div className="flex flex-wrap gap-2">
          {explanation.evidence.map((item) => (
            <span key={item} className="evidence-tag">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="investigation-disclaimer flex items-center gap-2">
        <AlertTriangle size={15} className="shrink-0 text-amber-400" />
        <span>This analysis represents an investigative intelligence signal and requires corroborating field evidence.</span>
      </div>
    </div>
  )
}

export default NetworkExplanationCard
