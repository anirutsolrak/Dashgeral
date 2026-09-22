import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { InventoryOverview, StockItem, StockItemKey } from '@/data/types/inventory'
import { createRng } from './random'
import { seedFor, volumeFactor } from './scale'
import { periodLabels } from './trend'

const ITEMS: { key: StockItemKey; label: string; base: number }[] = [
  { key: 'cards', label: 'Cartões', base: 1000 },
  { key: 'envelopes', label: 'Envelopes', base: 1200 },
  { key: 'letters', label: 'Cartas Berço', base: 1200 },
]

export function buildInventory(f: GlobalFilters): InventoryOverview {
  const rng = createRng(seedFor(f, 'inventory'))
  const factor = volumeFactor(f)
  const items: StockItem[] = ITEMS.map(({ key, label, base }) => {
    const total = Math.round(base * (0.9 + rng.next() * 0.2) * factor)
    const lost = Math.round(total * (0.03 + rng.next() * 0.04))
    const inTransit = Math.round(total * (0.1 + rng.next() * 0.1))
    return { key, label, total, lost, inTransit, available: total - lost - inTransit }
  })
  return { items, totalLost: items.reduce((sum, item) => sum + item.lost, 0) }
}

export function buildLossTrend(f: GlobalFilters): TrendPoint[] {
  const rng = createRng(seedFor(f, 'loss-trend'))
  const labels = periodLabels(f)
  const perPoint = buildInventory(f).totalLost / labels.length
  return labels.map((label) => ({ label, value: Math.round(perPoint * (0.7 + rng.next() * 0.6)) }))
}
