import { investigationGraph } from "../data/graphData"
import { dashboardStats } from "../data/mockData"

const API_BASE = "/api";

export interface BackendEntity {
  entity_id: string
  entity_type: string
  canonical_name: string
  aliases: string[]
  attributes: Record<string, any>
  confidence: number
}

export interface BackendRelationship {
  source: string
  target: string
  relationship: string
  confidence: number
  evidence: string
}

export interface BackendGraph {
  nodes: BackendEntity[]
  edges: BackendRelationship[]
}

export interface BackendInvestigation {
  investigation_id: string
  title: string
  description: string
  status: string
  risk_score: number
}

export interface HealthStatus {
  connected: boolean
  status: string
  entityCount?: number
  timestamp?: string
}

/**
 * Check health status of the FastAPI backend.
 */
export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" })
    if (res.ok) {
      const data = await res.json()
      return {
        connected: true,
        status: data.status || "ok",
        timestamp: new Date().toLocaleTimeString(),
      }
    }
  } catch {
    // Fallback if backend is offline
  }
  return { connected: false, status: "offline" }
}

/**
 * Fetch all entities from the backend with offline fallback.
 */
export async function fetchEntities(): Promise<BackendEntity[]> {
  try {
    const res = await fetch(`${API_BASE}/entities`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          ...item,
          id: item.entity_id || item.id,
          entity_id: item.entity_id || item.id,
          canonical_name: item.canonical_name || item.name || item.entity_id || item.id,
          entity_type: item.entity_type || item.type || "person",
        }))
      }
    }
  } catch (err) {
    console.warn("Backend /entities offline, using fallback dataset:", err)
  }
  // Fallback
  return (investigationGraph.nodes || []).map((n: any) => ({
    id: n.id,
    entity_id: n.id,
    entity_type: n.entity_type || n.type || "person",
    canonical_name: n.canonical_name || n.name || n.id,
    aliases: n.aliases || [],
    attributes: n.attributes || {},
    confidence: n.confidence || 0.9,
  }))
}

/**
 * Fetch graph topology (nodes + links) from backend.
 */
export async function fetchGraphData(): Promise<{ nodes: any[]; links: any[] }> {
  try {
    const res = await fetch(`${API_BASE}/graph`)
    if (res.ok) {
      const data: BackendGraph = await res.json()
      if (data.nodes && data.nodes.length > 0) {
        const nodes = data.nodes.map((n: any) => ({
          ...n,
          id: n.entity_id || n.id,
          entity_id: n.entity_id || n.id,
          entity_type: n.entity_type || n.type || "person",
          canonical_name: n.canonical_name || n.name || n.entity_id || n.id,
          aliases: n.aliases || [],
          attributes: n.attributes || {},
          confidence: n.confidence ?? 0.9,
          label: n.canonical_name || n.entity_id || n.id,
        }))

        const links = (data.edges || []).map((e: any) => ({
          source: e.source || e.source_entity_id,
          target: e.target || e.target_entity_id,
          relationship: e.relationship || e.relationship_type || "ASSOCIATED_WITH",
          confidence: e.confidence ?? 0.85,
          evidence: e.evidence || e.metadata?.evidence || "",
        }))

        return { nodes, links }
      }
    }
  } catch (err) {
    console.warn("Backend /graph offline, using fallback graph:", err)
  }

  return {
    nodes: investigationGraph.nodes || [],
    links: investigationGraph.links || [],
  }
}

/**
 * Fetch active investigations from the backend.
 */
export async function fetchInvestigations(): Promise<BackendInvestigation[]> {
  try {
    const res = await fetch(`${API_BASE}/investigations`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (err) {
    console.warn("Backend /investigations offline, using fallback:", err)
  }

  return [
    {
      investigation_id: "INV-2026-001",
      title: "Operation Nexus: Hawala Financial Channel Disruption",
      description: "Cross-border money laundering ring utilizing shell telecom SIMs.",
      status: "ACTIVE",
      risk_score: 0.94,
    },
    {
      investigation_id: "INV-2026-002",
      title: "Syndicate Logistics & Toll ANPR Movement Tracking",
      description: "Commercial vehicles operating unauthorized transit corridors.",
      status: "ACTIVE",
      risk_score: 0.84,
    },
  ]
}
