import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, User, Phone, CreditCard, Car, Building2, MapPin, ArrowUpRight, Database, RefreshCw } from "lucide-react"
import { investigationGraph } from "../data/graphData"
import EntityProfileCard from "../components/EntityProfileCard"
import { fetchEntities } from "../services/api"

const TYPE_ICONS: Record<string, any> = {
  person: User,
  phone: Phone,
  account: CreditCard,
  vehicle: Car,
  company: Building2,
  address: MapPin,
}

const TYPE_COLORS: Record<string, string> = {
  person: "border-teal-500/30 bg-teal-500/10 text-teal-400",
  phone: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  account: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  vehicle: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  company: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  address: "border-rose-500/30 bg-rose-500/10 text-rose-400",
}

function Entities() {
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [nodes, setNodes] = useState<any[]>(investigationGraph.nodes || [])
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadEntities = async () => {
    setLoading(true)
    try {
      const data = await fetchEntities()
      if (data && data.length > 0) {
        setNodes(data)
        setIsLive(true)
      }
    } catch {
      // Keep fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntities()
  }, [])

  const entityTypes = useMemo(() => {
    const types = new Set(nodes.map((n: any) => n.entity_type || n.type || "unknown"))
    return ["all", ...Array.from(types)]
  }, [nodes])

  const filteredNodes = useMemo(() => {
    return nodes.filter((node: any) => {
      const type = (node.entity_type || node.type || "").toLowerCase()
      const name = (node.canonical_name || node.name || node.id || "").toLowerCase()
      const id = String(node.id || node.entity_id || "").toLowerCase()
      const aliases = Array.isArray(node.aliases) ? node.aliases.join(" ").toLowerCase() : ""

      const matchesType = selectedType === "all" || type === selectedType
      const matchesSearch =
        !search.trim() ||
        name.includes(search.toLowerCase()) ||
        id.includes(search.toLowerCase()) ||
        aliases.includes(search.toLowerCase())

      return matchesType && matchesSearch
    })
  }, [nodes, search, selectedType])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Identified Entities</h2>
          <p className="mt-1 text-sm muted-text">
            Explore suspect profiles, phone records, bank accounts, and physical addresses
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <Database size={13} />
              SQLite DB Active
            </span>
          )}

          <span className="rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-teal-400">
            {filteredNodes.length} of {nodes.length} Entities Indexed
          </span>

          <button
            onClick={loadEntities}
            disabled={loading}
            title="Refresh entities from backend"
            className="rounded-md border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Featured Primary Suspect Profile Card */}
      <EntityProfileCard />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by entity name, ID, or alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition ${
                selectedType === type
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Entities Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNodes.map((entity: any) => {
          const type = (entity.entity_type || entity.type || "person").toLowerCase()
          const Icon = TYPE_ICONS[type] || User
          const colorClass = TYPE_COLORS[type] || "border-slate-700 bg-slate-800 text-slate-300"

          return (
            <div
              key={entity.id}
              className="app-surface flex flex-col justify-between p-5 transition hover:border-slate-700 hover:shadow-lg hover:shadow-teal-950/10"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {entity.canonical_name || entity.name || entity.id}
                      </h3>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500">
                        {entity.entity_type || entity.type}
                      </span>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                    ID: {entity.id}
                  </span>
                </div>

                {entity.aliases && entity.aliases.length > 0 && (
                  <div className="mt-3 text-xs text-slate-400">
                    <span className="text-slate-500">Aliases: </span>
                    {entity.aliases.join(", ")}
                  </div>
                )}

                {entity.attributes && Object.keys(entity.attributes).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(entity.attributes).map(([k, v]: [string, any]) => (
                      <span
                        key={k}
                        className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800"
                      >
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <span className="text-slate-500">
                  Confidence:{" "}
                  <span className="font-medium text-emerald-400">
                    {Math.round((entity.confidence || 0.9) * 100)}%
                  </span>
                </span>

                <Link
                  to={`/investigations?entityId=${encodeURIComponent(entity.id || entity.entity_id || "")}`}
                  className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium"
                >
                  <span>View in Graph</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Entities
