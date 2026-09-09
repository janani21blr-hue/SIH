import React, { createContext, useContext, useState } from "react"
import {
  User,
  Phone,
  CreditCard,
  Car,
  Building2,
  MapPin,
} from "lucide-react"

export interface FilterItem {
  key: string
  label: string
  icon: any
  color: string
  badgeClass: string
}

export const ENTITY_FILTERS: FilterItem[] = [
  {
    key: "person",
    label: "People",
    icon: User,
    color: "text-sky-400",
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  {
    key: "phone",
    label: "Phones",
    icon: Phone,
    color: "text-emerald-400",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  {
    key: "account",
    label: "Accounts",
    icon: CreditCard,
    color: "text-purple-400",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  {
    key: "vehicle",
    label: "Vehicles",
    icon: Car,
    color: "text-amber-400",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  {
    key: "company",
    label: "Companies",
    icon: Building2,
    color: "text-teal-400",
    badgeClass: "border-teal-500/30 bg-teal-500/10 text-teal-400",
  },
  {
    key: "address",
    label: "Addresses",
    icon: MapPin,
    color: "text-rose-400",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
]

export const RELATIONSHIP_TAGS = [
  { key: "USES", label: "USES", border: "border-sky-500/40", bg: "bg-sky-500/10", text: "text-sky-400" },
  { key: "OWNS", label: "OWNS", border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400" },
  { key: "LOCATED_AT", label: "LOCATED_AT", border: "border-rose-500/40", bg: "bg-rose-500/10", text: "text-rose-400" },
  { key: "DIRECTOR_OF", label: "DIRECTOR_OF", border: "border-teal-500/40", bg: "bg-teal-500/10", text: "text-teal-400" },
  { key: "REGISTERED_AT", label: "REGISTERED_AT", border: "border-rose-500/40", bg: "bg-rose-500/10", text: "text-rose-400" },
  { key: "CALLED", label: "CALLED", border: "border-cyan-500/40", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  { key: "TRANSACTED_WITH", label: "TRANSACTED", border: "border-violet-500/40", bg: "bg-violet-500/10", text: "text-violet-400" },
  { key: "KNOWS", label: "KNOWS", border: "border-slate-500/40", bg: "bg-slate-500/10", text: "text-slate-400" },
]

export const DEFAULT_ENTITY_FILTERS = [
  "person",
  "phone",
  "account",
  "vehicle",
  "company",
  "address",
]

export interface NetworkFilterContextType {
  activeFilters: string[]
  setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>
  activeRelationshipFilters: string[]
  setActiveRelationshipFilters: React.Dispatch<React.SetStateAction<string[]>>
  toggleFilter: (key: string) => void
  toggleRelationshipFilter: (key: string) => void
  resetFilters: () => void
}

const NetworkFilterContext = createContext<NetworkFilterContextType | null>(null)

export function NetworkFilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<string[]>(DEFAULT_ENTITY_FILTERS)
  const [activeRelationshipFilters, setActiveRelationshipFilters] = useState<string[]>([])

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev // Keep at least one filter active
        return prev.filter((k) => k !== key)
      } else {
        return [...prev, key]
      }
    });
  };

  const toggleRelationshipFilter = (key: string) => {
    setActiveRelationshipFilters((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      } else {
        return [...prev, key]
      }
    });
  };

  const resetFilters = () => {
    setActiveFilters(DEFAULT_ENTITY_FILTERS)
    setActiveRelationshipFilters([])
  }

  return (
    <NetworkFilterContext.Provider
      value={{
        activeFilters,
        setActiveFilters,
        activeRelationshipFilters,
        setActiveRelationshipFilters,
        toggleFilter,
        toggleRelationshipFilter,
        resetFilters,
      }}
    >
      {children}
    </NetworkFilterContext.Provider>
  )
}

export function useNetworkFilters(): NetworkFilterContextType {
  const ctx = useContext(NetworkFilterContext)
  if (!ctx) {
    throw new Error("useNetworkFilters must be used within NetworkFilterProvider")
  }
  return ctx
}
