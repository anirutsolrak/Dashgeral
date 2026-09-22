export interface LabelValue {
  label: string
  value: number
}
export interface SeriesRow {
  label: string
  [key: string]: string | number
}
export interface SeriesInfo {
  key: string
  label: string
}

export interface RechartsData {
  trend: LabelValue[]
  statusShare: LabelValue[]
  channels: SeriesInfo[]
  channelVolume: SeriesRow[]
  volumeVsTarget: SeriesRow[]
  units: SeriesInfo[]
  unitPerformance: SeriesRow[]
}

export interface HeatmapData {
  days: string[]
  hours: string[]
  cells: [number, number, number][]
}
export interface GaugeData {
  label: string
  value: number
  max: number
}
export interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
}
export interface SankeyData {
  nodes: { name: string }[]
  links: { source: string; target: string; value: number }[]
}
export interface EchartsData {
  heatmap: HeatmapData
  funnel: LabelValue[]
  gauge: GaugeData
  treemap: TreeNode[]
  sankey: SankeyData
}

export interface GeoPoint {
  id: string
  label: string
  lat: number
  lng: number
  value: number
  detail: string
}
export interface GeoHub {
  id: string
  label: string
  lat: number
  lng: number
}
export interface GeoRoute {
  id: string
  from: string
  to: string
  volume: number
}
export interface GeoCoverage {
  id: string
  label: string
  lat: number
  lng: number
  radiusKm: number
  detail: string
}
export interface MapsData {
  regionScores: GeoPoint[]
  branchScores: GeoPoint[]
  hubs: GeoHub[]
  routes: GeoRoute[]
  coverage: GeoCoverage[]
}

export type ShipmentStatus = 'Entregue' | 'Em trânsito' | 'Devolvido' | 'Extraviado'
export interface Shipment {
  id: string
  recipient: string
  city: string
  carrier: string
  status: ShipmentStatus
  amount: number
  weightKg: number
  progress: number
  events: string[]
}
export interface TablesData {
  shipments: Shipment[]
}

export interface GalleryOrgNode {
  id: string
  name: string
  role: string
  children: GalleryOrgNode[]
}
export interface GraphNode {
  id: string
  label: string
  status?: 'ok' | 'warning' | 'error'
  x: number
  y: number
}
export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}
export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
export interface FlowData {
  steps: { id: string; label: string }[]
  org: GalleryOrgNode
  pipeline: Graph
  decision: Graph
}
