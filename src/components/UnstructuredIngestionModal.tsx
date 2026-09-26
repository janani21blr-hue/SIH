import React, { useState } from "react"
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Plus,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone,
  CreditCard,
  Car,
  User,
  MapPin,
  X,
  Upload,
  Layers,
} from "lucide-react"

export interface ExtractedEntity {
  id: string
  canonical_name: string
  entity_type: "person" | "phone" | "account" | "vehicle" | "company" | "address"
  confidence: number
  mention: string
  role?: string
}

export interface ExtractedRelationship {
  source: string
  target: string
  relationship: string
  confidence: number
  evidence: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onIngest: (newNodes: any[], newLinks: any[]) => void
}

const PRESET_TEMPLATES = [
  {
    title: "📜 FIR #2026/089: Inter-State Hawala Smuggling Syndicate",
    category: "Police FIR",
    text: `FIRST INFORMATION REPORT (FIR No. 2026/089)
Police Station: Special Cell, Lodhi Colony, New Delhi
Date of Occurrence: 18-Sept-2026 | Informant: Insp. R. K. Varma

Summary of Allegations:
During surveillance of organized Hawala channels in Delhi-NCR, suspect Rajesh Kumar (alias 'RK Master', aged ~45 yrs) was intercepted operating multiple dummy Airtel SIMs (+91 9876543210 and +91 9811122233). Financial logs reveal Rajesh Kumar operates HDFC Bank current account (A/C No. •••• 4821) registered under fictitious firm 'North Star Trading Pvt Ltd' (CIN: DEMO-COMP-12) located at Connaught Place, New Delhi.

Co-conspirator Vikram Singh (alias 'Vicky', resident of Sector 18, Gurgaon) was observed coordinating physical cash drops using black SUV DL 3C AB 4821. Interrogation reveals ₹45,00,000 cash was routed from Account •••• 4821 to Axis Bank mule account •••• 7714 controlled by Vikram Singh for onward Hawala settlement.`,
  },
  {
    title: "📞 Interception Log: Burner Phone & Safehouse Interrogation",
    category: "CDR & Interrogation",
    text: `TRANSCRIPT OF RECORDED CDR INTERCEPT & INTERROGATION MEMO
Case Reference: Crime Branch Narcotics & Hawala Taskforce
Date: 22-Sept-2026 | Intercept Channel: Line 08-NCR

Subject: Rajesh Kumar was recorded placing 4 encrypted WhatsApp audio calls to contact Tariq Khan (+91 9898989898).
Keywords flagged: "Gaddi pahunch gayi", "Peti delivered at CP office", "Check HDFC Account 4821 balance".
Evidence: Vehicle DL 3C AB 4821 crossed Kherki Daula Toll plaza at 02:14 AM followed within 3 minutes by White Scorpio (HR 26 DK 8812). Both vehicles parked at Sector 18 Gurgaon warehouse.`,
  },
  {
    title: "🏢 MCA Registry Audit: 4 Shell Companies at Single Address",
    category: "Corporate Fraud",
    text: `REGISTRAR OF COMPANIES (ROC) INVESTIGATION REPORT
Subject: Co-located shell companies with common directorship.

Findings:
Company 'North Star Trading' (COMP_12) and 'Apex Apex Logistics' (COMP_05) are both registered at identical room 402, Barakhamba Road, Connaught Place, Delhi (ADDR_09).
Both entities declare Anil Sharma (P017) and Vikram Singh (P031) as common executive directors with signing power on bank accounts ACC_12 and ACC_19. Neither company possesses valid physical GST premises or electricity meter installations.`,
  },
]

export default function UnstructuredIngestionModal({
  isOpen,
  onClose,
  onIngest,
}: Props) {
  const [rawText, setRawText] = useState(PRESET_TEMPLATES[0].text)
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<{
    nodes: ExtractedEntity[]
    links: ExtractedRelationship[]
  } | null>(null)
  const [ingestedSuccess, setIngestedSuccess] = useState(false)

  if (!isOpen) return null

  const handleRunAI = () => {
    setIsProcessing(true)
    setIngestedSuccess(false)

    // Simulate deterministic NLP / NER Entity Resolution & Relationship extraction
    setTimeout(() => {
      const lower = rawText.toLowerCase()

      const nodes: ExtractedEntity[] = []
      const links: ExtractedRelationship[] = []

      // 1. Detect Persons
      if (lower.includes("rajesh kumar") || lower.includes("rk master")) {
        nodes.push({
          id: "P017",
          canonical_name: "Rajesh Kumar",
          entity_type: "person",
          confidence: 0.94,
          mention: "Rajesh Kumar (alias 'RK Master')",
          role: "Primary Syndicate Controller",
        })
      }
      if (lower.includes("vikram singh") || lower.includes("vicky")) {
        nodes.push({
          id: "P031",
          canonical_name: "Vikram Singh",
          entity_type: "person",
          confidence: 0.91,
          mention: "Vikram Singh (alias 'Vicky')",
          role: "Cash Drop & Logistics Operator",
        })
      }
      if (lower.includes("anil sharma")) {
        nodes.push({
          id: "P017_ANIL",
          canonical_name: "Anil Sharma",
          entity_type: "person",
          confidence: 0.89,
          mention: "Anil Sharma",
          role: "Shell Company Director",
        })
      }
      if (lower.includes("tariq khan")) {
        nodes.push({
          id: "P042",
          canonical_name: "Tariq Khan",
          entity_type: "person",
          confidence: 0.88,
          mention: "Tariq Khan",
          role: "Cross-Border Hawala Receiver",
        })
      }

      // 2. Detect Phones
      if (lower.includes("9876543210") || lower.includes("9811122233") || lower.includes("phone_08")) {
        nodes.push({
          id: "PHONE_08",
          canonical_name: "+91 9811122233",
          entity_type: "phone",
          confidence: 0.95,
          mention: "Airtel SIM +91 9811122233",
          role: "Burner SIM Node",
        })
      }
      if (lower.includes("9898989898") || lower.includes("phone_21")) {
        nodes.push({
          id: "PHONE_21",
          canonical_name: "+91 9898989898",
          entity_type: "phone",
          confidence: 0.93,
          mention: "Intercepted SIM +91 9898989898",
          role: "Encrypted Comms Node",
        })
      }

      // 3. Detect Accounts
      if (lower.includes("4821") || lower.includes("hdfc")) {
        nodes.push({
          id: "ACC_12",
          canonical_name: "HDFC Bank •••• 4821",
          entity_type: "account",
          confidence: 0.94,
          mention: "HDFC Current A/C •••• 4821",
          role: "Mule Layering Account",
        })
      }
      if (lower.includes("7714") || lower.includes("axis")) {
        nodes.push({
          id: "ACC_19",
          canonical_name: "Axis Bank •••• 7714",
          entity_type: "account",
          confidence: 0.91,
          mention: "Axis Bank A/C •••• 7714",
          role: "Settlement Treasury Account",
        })
      }

      // 4. Detect Vehicles
      if (lower.includes("dl 3c ab 4821") || lower.includes("veh_07")) {
        nodes.push({
          id: "VEH_07",
          canonical_name: "DL 3C AB 4821 (Black SUV)",
          entity_type: "vehicle",
          confidence: 0.92,
          mention: "Black SUV DL 3C AB 4821",
          role: "Hawala Cash Courier Transit",
        })
      }

      // 5. Detect Companies & Addresses
      if (lower.includes("north star") || lower.includes("comp_12")) {
        nodes.push({
          id: "COMP_12",
          canonical_name: "North Star Trading Pvt Ltd",
          entity_type: "company",
          confidence: 0.93,
          mention: "North Star Trading (CIN: DEMO-COMP-12)",
          role: "Shell Corporate Front",
        })
      }
      if (lower.includes("connaught place") || lower.includes("sector 18") || lower.includes("addr_09")) {
        nodes.push({
          id: "ADDR_09",
          canonical_name: "Barakhamba Rd, Connaught Place, Delhi",
          entity_type: "address",
          confidence: 0.95,
          mention: "Connaught Place, New Delhi",
          role: "Registered Physical Hub",
        })
      }

      // Relationships extraction
      if (nodes.some((n) => n.id === "P017") && nodes.some((n) => n.id === "PHONE_08")) {
        links.push({
          source: "P017",
          target: "PHONE_08",
          relationship: "USES",
          confidence: 0.94,
          evidence: "FIR 2026/089: Intercepted utilizing Airtel SIM for syndicate orders",
        })
      }
      if (nodes.some((n) => n.id === "P017") && nodes.some((n) => n.id === "ACC_12")) {
        links.push({
          source: "P017",
          target: "ACC_12",
          relationship: "OWNS",
          confidence: 0.94,
          evidence: "Banking signature card verifies Rajesh Kumar as authorized signatory",
        })
      }
      if (nodes.some((n) => n.id === "P031") && nodes.some((n) => n.id === "VEH_07")) {
        links.push({
          source: "P031",
          target: "VEH_07",
          relationship: "USES",
          confidence: 0.91,
          evidence: "Toll plaza ANPR & CCTV confirms Vikram Singh operating vehicle",
        })
      }
      if (nodes.some((n) => n.id === "ACC_12") && nodes.some((n) => n.id === "ACC_19")) {
        links.push({
          source: "ACC_12",
          target: "ACC_19",
          relationship: "TRANSACTED_WITH",
          confidence: 0.92,
          evidence: "NEFT Ledger: ₹45,00,000 transferred in 3 tranches on 18-Sept-2026",
        })
      }
      if (nodes.some((n) => n.id === "COMP_12") && nodes.some((n) => n.id === "ADDR_09")) {
        links.push({
          source: "COMP_12",
          target: "ADDR_09",
          relationship: "REGISTERED_AT",
          confidence: 0.94,
          evidence: "MCA Master Data filing confirms registered corporate office address",
        })
      }

      setExtractedData({ nodes, links })
      setIsProcessing(false)
    }, 600)
  }

  const handleCommitIngestion = () => {
    if (!extractedData) return
    onIngest(extractedData.nodes, extractedData.links)
    setIngestedSuccess(true)
    setTimeout(() => {
      onClose()
      setIngestedSuccess(false)
      setExtractedData(null)
    }, 1200)
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "person":
        return <User size={15} className="text-rose-400" />
      case "phone":
        return <Phone size={15} className="text-cyan-400" />
      case "account":
        return <CreditCard size={15} className="text-amber-400" />
      case "vehicle":
        return <Car size={15} className="text-purple-400" />
      case "company":
        return <Building2 size={15} className="text-teal-400" />
      default:
        return <MapPin size={15} className="text-emerald-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                AI Unstructured Crime Data & FIR Ingestion
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/40">
                  NER & RELATION EXTRACTOR
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Parse raw police FIRs, interrogation notes, CDR logs, or informant memos into structured graph entities.
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

        {/* Preset Selector */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Layers size={13} /> Quick Presets:
          </span>
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={tmpl.title}
              type="button"
              onClick={() => {
                setSelectedTemplateIndex(idx)
                setRawText(tmpl.text)
                setExtractedData(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
                selectedTemplateIndex === idx
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              {tmpl.category}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">
          {/* Left: Input Textarea */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Raw Unstructured Text / Case Memo</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {rawText.length} characters
              </span>
            </label>
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value)
                setExtractedData(null)
              }}
              rows={12}
              className="w-full flex-1 rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none font-mono leading-relaxed resize-none"
              placeholder="Paste raw police FIR, interrogation report, WhatsApp call log or banking audit summary here..."
            />
            <button
              type="button"
              onClick={handleRunAI}
              disabled={isProcessing || !rawText.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-50 transition shadow-lg shadow-teal-500/20"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Running AI Resolution & Relation Extractor...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Extract Entities & Relationships with AI
                </>
              )}
            </button>
          </div>

          {/* Right: Extracted Intelligence Preview */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-4 min-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-teal-400" />
                AI Extraction Preview & Confidence
              </span>
              {extractedData && (
                <span className="text-xs font-semibold text-teal-400">
                  {extractedData.nodes.length} entities · {extractedData.links.length} relations
                </span>
              )}
            </div>

            {!extractedData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Upload size={32} className="mb-2 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  Click <strong className="text-slate-400">Extract Entities & Relationships</strong> to analyze the text.
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Automatic NER models extract names, bank accounts, SIMs, and cross-linking evidence with calibrated confidence.
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {/* Extracted Nodes */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Resolved Entities ({extractedData.nodes.length})
                  </p>
                  <div className="space-y-1.5">
                    {extractedData.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1 rounded bg-slate-800">
                            {getEntityIcon(node.entity_type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {node.canonical_name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {node.role || node.mention}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                            {Math.round(node.confidence * 100)}% Conf
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extracted Links */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 pt-2 border-t border-slate-800">
                    Extracted Relationships & Evidence ({extractedData.links.length})
                  </p>
                  <div className="space-y-1.5">
                    {extractedData.links.map((link, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-teal-300 font-bold text-[11px]">
                            {link.source} → {link.relationship} → {link.target}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-400">
                            {Math.round(link.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          {link.evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {extractedData ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Extraction completed. Ready for knowledge graph integration.
              </span>
            ) : (
              <span>Ready for automated entity resolution.</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!extractedData || ingestedSuccess}
              onClick={handleCommitIngestion}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 text-xs font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-50 transition shadow-md shadow-teal-500/20"
            >
              {ingestedSuccess ? (
                <>
                  <CheckCircle2 size={15} className="text-slate-950" />
                  Successfully Merged into Graph!
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Ingest into Active Network Graph
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
