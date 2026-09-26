import React from "react"
import {
  ShieldAlert,
  Repeat,
  Radio,
  Building,
  Truck,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  X,
  Crosshair,
  FileCheck,
} from "lucide-react"
import type { SuspiciousPattern } from "../utils/networkAnalytics"

interface Props {
  isOpen: boolean
  onClose: () => void
  patterns: SuspiciousPattern[]
  onIsolatePattern: (pattern: SuspiciousPattern) => void
  activeIsolatedPatternId?: string | null
  onClearIsolation: () => void
}

export default function PatternRadarModal({
  isOpen,
  onClose,
  patterns,
  onIsolatePattern,
  activeIsolatedPatternId,
  onClearIsolation,
}: Props) {
  if (!isOpen) return null

  const getPatternIcon = (type: SuspiciousPattern["type"]) => {
    switch (type) {
      case "CIRCULAR_HAWALA":
        return <Repeat size={18} className="text-rose-400" />
      case "SIM_BURST":
        return <Radio size={18} className="text-amber-400" />
      case "SHELL_NETWORK":
        return <Building size={18} className="text-teal-400" />
      case "CONVOY_MOVEMENT":
        return <Truck size={18} className="text-blue-400" />
      default:
        return <AlertTriangle size={18} className="text-orange-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Suspicious Pattern & Ring Detection Radar
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/40">
                  {patterns.length} ACTIVE THREATS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated detection of complex crime topologies: Circular Hawala routing, SIM bursts, and Shell co-locations.
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

        {/* Isolation notice if active */}
        {activeIsolatedPatternId && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-teal-500/10 border border-teal-500/30 px-4 py-2 text-xs text-teal-300 shrink-0">
            <span>
              Graph is currently isolating a suspicious pattern ring.
            </span>
            <button
              onClick={onClearIsolation}
              className="font-bold underline hover:text-teal-200"
            >
              Reset to Full Graph View
            </button>
          </div>
        )}

        {/* Patterns List */}
        <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
          {patterns.map((pat) => {
            const isIsolated = activeIsolatedPatternId === pat.id

            return (
              <div
                key={pat.id}
                className={`rounded-xl border p-5 transition ${
                  isIsolated
                    ? "border-teal-400 bg-slate-800 shadow-lg shadow-teal-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                {/* Title & Severity */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      {getPatternIcon(pat.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {pat.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">
                          {pat.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {pat.description}
                      </p>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border"
                      style={{
                        color: pat.severityColor,
                        borderColor: `${pat.severityColor}40`,
                        background: `${pat.severityColor}15`,
                      }}
                    >
                      {pat.severity} SEVERITY
                    </span>
                    <div className="text-[10px] text-teal-400 font-mono mt-1 font-semibold">
                      {pat.corroborationScore}% Corroboration
                    </div>
                  </div>
                </div>

                {/* Evidence Summary List */}
                <div className="mt-4 rounded-xl bg-slate-900/80 border border-slate-800/80 p-3.5 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileCheck size={13} className="text-teal-400" />
                    Multi-Source Corroborating Evidence
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {pat.evidenceSummary.map((ev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-400 mt-1 font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connected Nodes Badges */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Involved Nodes ({pat.nodeIds.length}):
                  </span>
                  {pat.nodeIds.map((nodeId) => (
                    <span
                      key={nodeId}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-semibold text-slate-300 border border-slate-700"
                    >
                      {nodeId}
                    </span>
                  ))}
                </div>

                {/* Recommended Action & Isolate Button */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    <span>
                      <strong>Action:</strong> {pat.recommendedAction}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isIsolated) {
                        onClearIsolation()
                      } else {
                        onIsolatePattern(pat)
                        onClose()
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                      isIsolated
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
                        : "bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-md shadow-teal-500/20"
                    }`}
                  >
                    <Crosshair size={13} />
                    {isIsolated ? "Clear Ring Isolation" : "Isolate Ring on Graph"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Algorithmic verification strictly cites exact graph paths & ledger entries.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  )
}
