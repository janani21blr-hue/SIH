import { Link } from "react-router-dom"
import { ArrowUpRight, Phone, MapPin, CreditCard, Car, ShieldAlert } from "lucide-react"

export interface EntityProfile {
  entity_id: string
  entity_type: string
  canonical_name: string
  aliases: string[]
  attributes: Record<string, string>
  confidence: number
}

const defaultEntity: EntityProfile = {
  entity_id: "P042",
  entity_type: "person",
  canonical_name: "Rajesh Kumar",
  aliases: ["R. Kumar", "Raj Kumar"],
  attributes: {
    phone: "+91 9876543210",
    address: "Connaught Place, Delhi",
    bank_account: "Account •••• 4821",
    vehicle: "DL 3C AB 4821",
  },
  confidence: 0.94,
}

const ATTRIBUTE_ICONS: Record<string, any> = {
  phone: Phone,
  address: MapPin,
  bank_account: CreditCard,
  vehicle: Car,
}

function EntityProfileCard({ entity = defaultEntity }: { entity?: EntityProfile }) {
  return (
    <div className="app-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="entity-type-badge">{entity.entity_type}</span>
            <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-400">
              HIGH INTEREST
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">{entity.canonical_name}</h3>
          <p className="text-xs text-slate-400">Entity ID: <span className="font-mono text-slate-300">{entity.entity_id}</span></p>
        </div>

        <div className="entity-avatar">
          {entity.canonical_name.charAt(0)}
        </div>
      </div>

      {/* Confidence */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Resolution Confidence</span>
          <strong className="text-teal-300 font-mono">{Math.round(entity.confidence * 100)}%</strong>
        </div>
        <div className="confidence-progress">
          <div
            className="confidence-progress-fill"
            style={{ width: `${entity.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Aliases */}
      {entity.aliases && entity.aliases.length > 0 && (
        <div className="mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            Known Aliases
          </span>
          <div className="flex flex-wrap gap-1.5">
            {entity.aliases.map((alias) => (
              <span
                key={alias}
                className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-300"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attributes Grid */}
      <div className="mt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
          Linked Indicators
        </span>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(entity.attributes).map(([key, value]) => {
            const Icon = ATTRIBUTE_ICONS[key] || ShieldAlert
            return (
              <div key={key} className="attribute-item flex items-start gap-2.5">
                <Icon size={14} className="mt-0.5 shrink-0 text-teal-400" />
                <div className="min-w-0">
                  <span>{key.replace("_", " ")}</span>
                  <strong className="truncate block">{value}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
        <span className="text-xs text-slate-500">Cross-referenced in 4 investigations</span>
        <Link
          to={`/investigations?entityId=${encodeURIComponent(entity.entity_id || "")}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
        >
          <span>Focus in Network Graph</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  )
}

export default EntityProfileCard
