import { Link } from "react-router-dom"
import { Network, ArrowRight, ShieldCheck, Zap } from "lucide-react"

function GraphPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/60 p-6">
      {/* Decorative background grid and glow */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-300">
            <Zap size={13} className="text-teal-400" />
            LIVE SIMULATION ACTIVE
          </div>

          <h3 className="mt-3 text-lg font-bold text-white">
            Criminal Syndicate Nexus
          </h3>

          <p className="mt-1 text-sm text-slate-400 max-w-md">
            Interactive multi-dimensional force graph modeling 180+ suspect nodes, call detail records, financial transactions, and vehicle movements.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              People & Suspects
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Phone Records
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Financial Accounts
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            to="/investigations"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-teal-400/40 bg-teal-500/20 px-5 py-3 text-sm font-semibold text-teal-200 shadow-lg shadow-teal-950/40 transition hover:bg-teal-500/30 hover:border-teal-400/60 hover:text-white"
          >
            <Network size={18} className="text-teal-300 transition group-hover:scale-110" />
            <span>Open Investigation Canvas</span>
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GraphPlaceholder