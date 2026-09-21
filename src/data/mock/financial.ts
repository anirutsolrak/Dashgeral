import type { TrendPoint } from '@/data/types/card-processing'
import type { FinancialOverview, RegionUnlock } from '@/data/types/financial'
import type { GlobalFilters } from '@/data/types/filters'
import { buildOverview } from './overview'
import { createRng } from './random'
import { pct, periodFactor, seedFor, splitByWeights, volumeFactor } from './scale'
import { periodLabels } from './trend'

const RANGES = ['0-25%', '26-50%', '51-75%', '76-100%'] as const
const RANGE_AVERAGE = [1200, 2300, 3100, 3800] as const
const RANGE_AVAILABLE = [800, 1500, 2000, 2500] as const

const STATUSES = ['Entregue', 'Em trânsito', 'Custódia', 'Em devolução', 'Devolvido'] as const
const COST_PER_CARD = [40, 38, 35, 42, 45] as const
const AVAILABLE_PER_CARD = [35, 32, 30, 28, 25] as const

const UNIT_COSTS = { card: 15, envelope: 8, letter: 5, shipping: 12 } as const

const REGIONS = [
  { region: 'norte', label: 'Norte', unlocked: 1500, locked: 300, lat: -3.4, lng: -60 },
  { region: 'nordeste', label: 'Nordeste', unlocked: 2500, locked: 700, lat: -9, lng: -40 },
  { region: 'sudeste', label: 'Sudeste', unlocked: 5500, locked: 1000, lat: -20, lng: -45 },
  { region: 'sul', label: 'Sul', unlocked: 3000, locked: 400, lat: -27, lng: -51.5 },
  { region: 'centro-oeste', label: 'Centro-Oeste', unlocked: 2000, locked: 500, lat: -15.5, lng: -54 },
] as const

export function buildFinancialOverview(f: GlobalFilters): FinancialOverview {
  const rng = createRng(seedFor(f, 'financial'))
  const customers = Math.round(rng.int(900, 1100) * volumeFactor(f))
  const usageByRange = splitByWeights(customers, RANGES, rng).map((slice, i) => ({
    range: slice.reason,
    customers: slice.count,
    percent: pct(slice.count, customers),
    average: Math.round((RANGE_AVERAGE[i] ?? 0) * (0.95 + rng.next() * 0.1)),
    averageAvailable: Math.round((RANGE_AVAILABLE[i] ?? 0) * (0.95 + rng.next() * 0.1)),
  }))
  const usedAmount = usageByRange.reduce((sum, r) => sum + r.customers * r.average, 0)
  const availableAmount = usageByRange.reduce((sum, r) => sum + r.customers * r.averageAvailable, 0)

  const sent = buildOverview(f).cards.sent
  const byStatus = splitByWeights(sent, STATUSES, rng).map((slice, i) => ({
    status: slice.reason,
    count: slice.count,
    amount: slice.count * (COST_PER_CARD[i] ?? 0),
    costPerCard: COST_PER_CARD[i] ?? 0,
    availablePerCard: AVAILABLE_PER_CARD[i] ?? 0,
  }))

  return {
    limitUsage: {
      ratePercent: pct(usedAmount, usedAmount + availableAmount),
      usedAmount,
      totalAmount: usedAmount + availableAmount,
      averageUsage: customers === 0 ? 0 : Math.round(usedAmount / customers),
      customers,
    },
    usageByRange,
    logistics: {
      totalAmount: byStatus.reduce((sum, s) => sum + s.amount, 0),
      unit: { ...UNIT_COSTS },
      unitTotal: UNIT_COSTS.card + UNIT_COSTS.envelope + UNIT_COSTS.letter + UNIT_COSTS.shipping,
      byStatus,
    },
  }
}

export function buildUnlockByRegion(f: GlobalFilters): RegionUnlock[] {
  const rng = createRng(seedFor(f, 'unlock'))
  const factor = periodFactor(f)
  return REGIONS.map((r) => {
    const k = factor * (0.9 + rng.next() * 0.2)
    return {
      region: r.region,
      label: r.label,
      unlocked: Math.round(r.unlocked * k),
      locked: Math.round(r.locked * k),
      lat: r.lat,
      lng: r.lng,
    }
  }).filter((r) => f.region === 'all' || r.region === f.region)
}

export function buildUsageEvolution(f: GlobalFilters): TrendPoint[] {
  const rng = createRng(seedFor(f, 'usage-evolution'))
  const averageThousands = buildFinancialOverview(f).limitUsage.averageUsage / 1000
  return periodLabels(f).map((label) => ({
    label,
    value: Math.round(averageThousands * (0.85 + rng.next() * 0.3) * 10) / 10,
  }))
}
