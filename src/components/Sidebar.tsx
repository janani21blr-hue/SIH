import { NavLink } from "react-router-dom"

function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Investigations", path: "/investigations" },
    { name: "Entities", path: "/entities" },
    { name: "Reports", path: "/reports" },
  ]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-4 md:block">
      <div className="mb-8">
        <h2 className="text-lg font-bold">CNAS</h2>

        <p className="mt-1 text-xs text-slate-400">
          Investigation Intelligence
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-slate-800 font-medium text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar