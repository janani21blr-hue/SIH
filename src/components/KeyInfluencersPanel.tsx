import React, { useState } from "react"
import {
  Crown,
  Zap,
  PhoneCall,
  Building,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Filter,
  CheckCircle2,
  X,
  Crosshair,
} from "lucide-react"
import type { InfluencerNode } from "../utils/networkAnalytics"

interface Props {
  isOpen: boolean
  onClose: () => void
  influencers: InfluencerNode[]
  onSelectEntity: (entityId: string) => void
  selectedEntityId?: string
}

export default function KeyInfluencersPanel({
  isOpen,
  onClose,
  influencers,
  onSelectEntity,
  selectedEntityId,
}: Props) {
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

  if (!isOpen) return null

  const filteredInfluencers = influencers.filter((inf) => {
    if (roleFilter === "ALL") return true
    return inf.role === roleFilter
  })

  const getRoleIcon = (role: InfluencerNode["role"]) => {
    switch (role) {
      case "KINGPIN":
        return <Crown size={15} className="text-rose-400" />
      case "FINANCIAL_CONDUIT":
        return <Zap size={15} className="text-amber-400" />
      case "COMMUNICATION_HUB":
        return <PhoneCall size={15} className="text-cyan-400" />
      case "SHELL_DIRECTOR":
        return <Building size={15} className="text-teal-400" />
      default:
        return <Activity size={15} className="text-slate-400" />
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-slate-900/95 backdrop-blur-md border-l border-slate-700 shadow-2xl p-5 flex flex-col transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Crown size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Key Influencers & Kingpins
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by Betweenness Centrality & PageRank
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        {["ALL", "KINGPIN", "FINANCIAL_CONDUIT", "COMMUNICATION_HUB", "SHELL_DIRECTOR"].map(
          (r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition shrink-0 ${
                roleFilter === r
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              {r === "ALL" ? "All Ranks" : r.replace("_", " ")}
            </button>
          )
        )}
      </div>

      {/* Influencers List */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 min-h-0">
        {filteredInfluencers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No influencers match the selected filter.
          </div>
        ) : (
          filteredInfluencers.map((node, index) => {
            const isSelected = selectedEntityId === node.id

            return (
              <div
                key={node.id}
                className={`group relative rounded-xl border p-3.5 transition ${
                  isSelected
                    ? "border-teal-400 bg-slate-800/90 shadow-lg shadow-teal-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition">
                        {node.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {node.id} · {node.type}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 border"
                    style={{
                      color: node.roleColor,
                      borderColor: `${node.roleColor}40`,
                      background: `${node.roleColor}15`,
                    }}
                  >
                    {getRoleIcon(node.role)}
                    {node.roleLabel}
                  </span>
                </div>

                {/* Centrality Metrics Grid */}
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-900/60 p-2 text-center">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                      Influence
                    </span>
                    <strong className="text-xs font-bold text-rose-400 font-mono">
                      {node.influenceScore}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                      Betweenness
                    </span>
                    <strong className="text-xs font-bold text-amber-300 font-mono">
                      {node.betweenness}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                      Conf Match
                    </span>
                    <strong className="text-xs font-bold text-teal-300 font-mono">
                      {node.confidence}%
                    </strong>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400">
                    {node.connectionsCount} direct relationships
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectEntity(node.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
                  >
                    <Crosshair size={13} />
                    Inspect & Center
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <span>Computed via Spectral Graph Analytics</span>
        <span className="text-teal-400 font-mono font-bold">
          {influencers.length} Total Nodes Analyzed
        </span>
      </div>
    </div>
  )
}
