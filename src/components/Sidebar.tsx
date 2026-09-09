import { NavLink } from "react-router-dom"
import { LayoutDashboard, Network, Users, FileText, ShieldAlert } from "lucide-react"

function Sidebar() {
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
      </div>

      <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>System Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">SIH26189 Neural Engine</p>
      </div>
    </aside>
  )
}

export default Sidebar