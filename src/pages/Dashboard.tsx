import { dashboardStats } from "../data/mockData"

function Dashboard() {
  const stats = [
    {
      label: "Investigations",
      value: dashboardStats.investigations,
    },
    {
      label: "Entities",
      value: dashboardStats.entities,
    },
    {
      label: "Relationships",
      value: dashboardStats.relationships,
    },
    {
      label: "High-Risk Networks",
      value: dashboardStats.highRiskNetworks,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-2 text-slate-400">
          Overview of investigations and criminal networks
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>

            <p className="mt-3 text-3xl font-bold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard