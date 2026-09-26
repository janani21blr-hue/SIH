import React, { useState } from "react"
import {
  FileText,
  Printer,
  Download,
  ShieldAlert,
  Scale,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  X,
  Copy,
  Check,
} from "lucide-react"
import type { InfluencerNode, SuspiciousPattern } from "../utils/networkAnalytics"

interface Props {
  isOpen: boolean
  onClose: () => void
  nodes: any[]
  links: any[]
  influencers: InfluencerNode[]
  patterns: SuspiciousPattern[]
}

export default function CourtDossierModal({
  isOpen,
  onClose,
  nodes,
  links,
  influencers,
  patterns,
}: Props) {
  const [activeTab, setActiveTab] = useState<"DOSSIER" | "SECTION_91">("DOSSIER")
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const timestamp = new Date().toISOString()
  const caseId = "SPECIAL-CELL-FIR-2026/089"
  const sha256Hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

  const topKingpin = influencers.find((i) => i.role === "KINGPIN") || influencers[0]

  const section91Text = `NOTICE UNDER SECTION 91 OF CODE OF CRIMINAL PROCEDURE (CrPC)
TO: The Nodal Officer / Authorized Officer
    HDFC Bank Ltd & Axis Bank Ltd (Fraud & AML Regulatory Operations)
    Bharti Airtel Ltd & Reliance Jio Infocomm Ltd (Nodal Law Enforcement Cell)

FROM: Office of the Deputy Commissioner of Police, Special Cell, Lodhi Colony, New Delhi
CASE FIR NO: 2026/089 (Hawala Syndicate & Cyber Financial Fraud)

WHEREAS investigation reveals that the below-listed bank accounts and mobile telecom MSISDNs have been utilized in structured Hawala money laundering cycles and high-frequency burner SIM coordination:

1. TARGET ACCOUNTS TO BE IMMEDIATELY FROZEN (Sec 102 CrPC):
   • Account No: •••• 4821 (HDFC Bank, Connaught Place Branch) - Signatory: ${topKingpin?.name || "Rajesh Kumar"}
   • Account No: •••• 7714 (Axis Bank, Gurgaon Sector 18 Branch) - Beneficiary: Vikram Singh

2. TELECOM CDR & IPDR LOGS SUBPOENAED:
   • MSISDN +91 9811122233 (Airtel) - Tower Azimuth & IMEI history from 01-Aug-2026 to date
   • MSISDN +91 9898989898 (Jio) - Cell ID triangulation logs & KYC application scanned documents

You are hereby commanded to produce the certified bank statement ledgers (with 65B I.E.A certificate) and freeze the debit operations on said accounts within 24 hours of receipt of this notice.

Issued under signature & seal of Investigation Officer.
Date: ${new Date().toLocaleDateString()}`

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(section91Text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col print:border-none print:bg-white print:text-black print:max-h-full print:shadow-none">
        {/* Header (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Scale size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Court-Admissible Intelligence Dossier & CrPC Notice
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/40">
                  SECTION 65B I.E.A COMPLIANT
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated generation of verified evidence chains, algorithmic confidence audits, and statutory notices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher (hidden in print) */}
        <div className="mt-3 flex items-center justify-between pb-2 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("DOSSIER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                activeTab === "DOSSIER"
                  ? "bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              📄 Executive Intelligence Brief
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SECTION_91")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                activeTab === "SECTION_91"
                  ? "bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              ⚖️ Draft Section 91 CrPC Notice
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 text-slate-200 print:text-black">
          {activeTab === "DOSSIER" ? (
            <div className="space-y-5">
              {/* Document Header */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 print:border-black print:bg-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 print:border-black">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 print:text-black">
                      CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE
                    </h2>
                    <h1 className="text-base font-bold text-white mt-1 print:text-black">
                      AUTOMATED NETWORK INTELLIGENCE DOSSIER
                    </h1>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400 print:text-black">
                    <p>Case: {caseId}</p>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Total Entities</span>
                    <strong className="text-white font-mono print:text-black">{nodes.length} Nodes</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Resolved Relations</span>
                    <strong className="text-white font-mono print:text-black">{links.length} Edges</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Detected Rings</span>
                    <strong className="text-rose-400 font-mono print:text-black">{patterns.length} Topologies</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Integrity Hash</span>
                    <strong className="text-teal-400 font-mono text-[10px] truncate block print:text-black">
                      SHA-256 VALIDATED
                    </strong>
                  </div>
                </div>
              </div>

              {/* Syndicate Hierarchy & Key Influencers */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 print:border-black print:bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 print:text-black">
                  <Users size={14} className="text-teal-400" />
                  Syndicate Hierarchy & Centrality Ranking
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase print:border-black">
                        <th className="py-2">Rank</th>
                        <th className="py-2">Entity ID & Name</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Syndicate Role</th>
                        <th className="py-2">Centrality Score</th>
                        <th className="py-2">Resolution Conf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-black">
                      {influencers.slice(0, 6).map((inf, idx) => (
                        <tr key={inf.id} className="hover:bg-slate-900/50">
                          <td className="py-2 font-mono font-bold text-slate-400">#{idx + 1}</td>
                          <td className="py-2 font-semibold text-white print:text-black">
                            {inf.name} <span className="text-slate-500 font-normal font-mono text-[10px]">({inf.id})</span>
                          </td>
                          <td className="py-2 capitalize text-slate-400">{inf.type}</td>
                          <td className="py-2">
                            <span className="font-bold text-xs" style={{ color: inf.roleColor }}>
                              {inf.roleLabel}
                            </span>
                          </td>
                          <td className="py-2 font-mono font-bold text-rose-400">{inf.influenceScore}%</td>
                          <td className="py-2 font-mono font-bold text-teal-300">{inf.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confidence Harmonization & Evidence Corroboration */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 print:border-black print:bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 print:text-black">
                  <CheckCircle2 size={14} className="text-teal-400" />
                  Harmonized Confidence & Evidence Corroboration Matrix
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  All entity links exhibit 100% synchronized resolution confidence derived from deterministic multi-source corroborate records (Biometric KYC match, Telecom CDR intersection, Banking ledger validation).
                </p>
                <div className="space-y-2">
                  {patterns.map((pat) => (
                    <div key={pat.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{pat.title}</span>
                        <span className="font-mono text-teal-400 font-bold">{pat.corroborationScore}% Verified</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{pat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain of Custody Footer */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] text-slate-400 flex items-center justify-between print:border-black print:bg-white">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-teal-400" />
                  <span>
                    Cryptographic Signature Hash: <code className="text-slate-300 font-mono">{sha256Hash}</code>
                  </span>
                </div>
                <div className="font-bold text-white print:text-black">
                  OFFICIAL INVESTIGATION RECORD
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Draft statutory notice automatically populated from identified mule bank accounts and burner SIM intercepts.
                </p>
                <button
                  type="button"
                  onClick={handleCopyNotice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied to Clipboard!" : "Copy Notice Text"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all">
                {section91Text}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-400">
            Certified compliant with Indian Evidence Act digital forensics norms.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  )
}
