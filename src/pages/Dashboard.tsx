import { dashboardStats } from "../data/mockData"
import SectionCard from "../components/SectionCard"
import StatCard from "../components/StatCard"
import ActivityList from "../components/ActivityList"
import GraphPlaceholder from "../components/GraphPlaceholder"

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
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="page-title">Dashboard</h2>

        <p className="mt-2 muted-text">
          Overview of investigations and criminal networks
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      {/* Network Overview + High-Risk Networks */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Network Overview"
          description="Interactive criminal network visualization"
          className="min-h-80 lg:col-span-2"
        >
          <GraphPlaceholder />
        </SectionCard>

        <SectionCard
          title="High-Risk Networks"
          description="Networks requiring investigator attention"
          className="min-h-80"
        >
          <div className="mt-6 text-4xl font-bold">
            {dashboardStats.highRiskNetworks}
          </div>

          <p className="mt-2 text-sm muted-text">
            networks flagged for review
          </p>
        </SectionCard>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <SectionCard
          title="Recent Activity"
          description="Latest investigation intelligence updates"
        >
          <ActivityList />
        </SectionCard>
      </div>
    </div>
  )
}

export default Dashboard