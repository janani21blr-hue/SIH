import { NavLink } from "react-router-dom"

function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Investigations", path: "/investigations" },
    { name: "Entities", path: "/entities" },
    { name: "Reports", path: "/reports" },
  ]

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
      <div className="mb-8">
        <h2 className="text-lg font-bold">CNAS</h2>
        <p className="text-xs text-slate-400">
          Investigation Intelligence
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block w-full rounded-lg px-4 py-3 ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800"
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