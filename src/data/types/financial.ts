import type { GlobalFilters } from './filters'

export type RegionKey = Exclude<GlobalFilters['region'], 'all'>

export interface LimitUsage {
  ratePercent: number
  usedAmount: number
  totalAmount: number
  averageUsage: number
  customers: number
}

export interface UsageRange {
  range: string
  customers: number
  percent: number
  average: number
  averageAvailable: number
}

export interface CostByStatus {
  status: string
  count: number
  amount: number
  costPerCard: number
  availablePerCard: number
}

export interface LogisticsUnitCosts {
  card: number
  envelope: number
  letter: number
  shipping: number
}

export interface LogisticsCosts {
  totalAmount: number
  unit: LogisticsUnitCosts
  unitTotal: number
  byStatus: CostByStatus[]
}

export interface FinancialOverview {
  limitUsage: LimitUsage
  usageByRange: UsageRange[]
  logistics: LogisticsCosts
}

export interface RegionUnlock {
  region: RegionKey
  label: string
  unlocked: number
  locked: number
  lat: number
  lng: number
}
