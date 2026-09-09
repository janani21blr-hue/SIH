import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Network, Users, FileText, ShieldAlert, Database, RotateCcw } from "lucide-react"
import { checkBackendHealth, type HealthStatus } from "../services/api"
import {
  useNetworkFilters,
  ENTITY_FILTERS,
  RELATIONSHIP_TAGS,
} from "../context/NetworkFilterContext"

function Sidebar() {
  const [health, setHealth] = useState<HealthStatus>({ connected: false, status: "checking" })
  const {
    activeFilters,
    activeRelationshipFilters,
    toggleFilter,
    toggleRelationshipFilter,
    resetFilters,
  } = useNetworkFilters()

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      const res = await checkBackendHealth()
      if (mounted) {
        setHealth(res)
      }
    }

    poll()
    const interval = setInterval(poll, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Investigations", path: "/investigations", icon: Network },
    { name: "Entities", path: "/entities", icon: Users },
    { name: "Reports", path: "/reports", icon: FileText },
  ]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800/80 bg-slate-950 p-5 md:flex md:flex-col justify-between">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-400 shadow-sm">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white">CNAS</h2>
            <p className="text-[11px] text-slate-400">Intelligence Platform</p>
          </div>
        </div>

        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* GRAPH & NODE FILTERS */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                <Network size={14} className="text-teal-400" />
                <span>GRAPH & NODE FILTERS</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Active node filters for graph canvas
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900/80 px-1.5 py-1 text-[10px] text-slate-400 hover:text-teal-300 hover:border-teal-500/30 transition"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            {ENTITY_FILTERS.map((f) => {
              const Icon = f.icon
              const isActive = activeFilters.includes(f.key)
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFilter(f.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition border ${
                    isActive
                      ? "border-teal-500/40 bg-teal-500/15 text-teal-200 shadow-sm shadow-teal-950/20"
                      : "border-slate-800/80 bg-slate-900/50 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  <Icon size={12} className={isActive ? f.color : "text-slate-500"} />
                  <span className="capitalize">{f.label}</span>
                </button>
              )
            })}
          </div>

          {/* Relationship Links */}
          <div className="mt-3.5">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 px-1 mb-1.5">
              Relationship Links
            </div>
            <div className="flex flex-wrap gap-1">
              {RELATIONSHIP_TAGS.map((rel) => {
                const isActive = activeRelationshipFilters.length === 0 || activeRelationshipFilters.includes(rel.key)
                return (
                  <button
                    key={rel.key}
                    type="button"
                    onClick={() => toggleRelationshipFilter(rel.key)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition border ${
                      isActive
                        ? `${rel.bg} ${rel.border} ${rel.text}`
                        : "border-slate-800/80 bg-slate-900/40 text-slate-600 hover:text-slate-400"
                    }`}
                  >
                    {rel.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database size={13} className="text-slate-400" />
              FastAPI Backend
            </span>
            {health.connected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live :8000
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Local Cache
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            {health.connected ? "SQLite Connected (sih_investigation.db)" : "Syncing live telemetry..."}
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar