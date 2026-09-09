import { useState, useEffect } from "react"
import SectionCard from "../components/SectionCard"
import StatCard from "../components/StatCard"
import ActivityList from "../components/ActivityList"
import GraphPlaceholder from "../components/GraphPlaceholder"
import RiskDistributionChart from "../components/RiskDistributionChart"
import InvestigationTimelineChart from "../components/InvestigationTimelineChart"
import NetworkExplanationCard from "../components/NetworkExplanationCard"
import { fetchEntities, fetchGraphData, fetchInvestigations, checkBackendHealth } from "../services/api"

function Dashboard() {
  const [stats, setStats] = useState({
    investigations: 24,
    entities: 103,
    relationships: 37,
    highRiskNetworks: 7,
  })
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let active = true

    async function loadLiveData() {
      try {
        const [health, entities, graph, invs] = await Promise.all([
          checkBackendHealth(),
          fetchEntities(),
          fetchGraphData(),
          fetchInvestigations(),
        ])

        if (active) {
          setIsLive(health.connected)
          setStats({
            investigations: invs.length > 0 ? invs.length : 24,
            entities: entities.length > 0 ? entities.length : 103,
            relationships: graph.links.length > 0 ? graph.links.length : 37,
            highRiskNetworks: 7,
          })
        }
      } catch (err) {
        console.warn("Failed to load dashboard live stats:", err)
      }
    }

    loadLiveData()
    return () => {
      active = false
    }
  }, [])

  const statCards = [
    {
      label: "Active Investigations",
      value: stats.investigations,
    },
    {
      label: "Resolved Entities",
      value: stats.entities,
    },
    {
      label: "Mapped Relationships",
      value: stats.relationships,
    },
    {
      label: "High-Risk Syndicates",
      value: stats.highRiskNetworks,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Executive Intelligence Dashboard</h2>
          <p className="mt-1 text-sm muted-text">
            Automated intelligence overview, risk categorization, and syndicate link analysis
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              FASTAPI LIVE • PORT 8000
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              LOCAL CACHE ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      {/* Network Overview Card */}
      <SectionCard
        title="Interactive Network Overview"
        description="Graph intelligence engine and syndicate cluster analysis"
      >
        <GraphPlaceholder />
      </SectionCard>

      {/* Analytics Charts Grid: Risk Distribution + Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Risk Level Distribution"
          description="Identified syndicate entities categorized by calculated threat severity"
        >
          <RiskDistributionChart />
        </SectionCard>

        <SectionCard
          title="Investigation Activity Timeline"
          description="Cross-border relationship detection velocity and evidence events"
        >
          <InvestigationTimelineChart />
        </SectionCard>
      </div>

      {/* Bottom Grid: Explain Network + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Automated Network Explanation"
          description="Evidence-driven rationale for high-priority syndicate flags"
          className="lg:col-span-2"
        >
          <NetworkExplanationCard />
        </SectionCard>

        <SectionCard
          title="Recent Investigation Feed"
          description="Latest suspect identifications & link alerts"
        >
          <ActivityList />
        </SectionCard>
      </div>
    </div>
  )
}

export default Dashboard