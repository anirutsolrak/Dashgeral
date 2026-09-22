import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildInventory, buildLossTrend } from './inventory'

describe('buildInventory', () => {
  const inv = buildInventory(DEFAULT_FILTERS)

  it('has the three stock items with balanced quantities', () => {
    expect(inv.items.map((i) => i.key)).toEqual(['cards', 'envelopes', 'letters'])
    expect(inv.items.map((i) => i.label)).toEqual(['Cartões', 'Envelopes', 'Cartas Berço'])
    for (const item of inv.items) {
      expect(item.available + item.inTransit + item.lost).toBe(item.total)
      expect(item.available).toBeGreaterThan(0)
      expect(item.lost).toBeGreaterThanOrEqual(0)
    }
    expect(inv.totalLost).toBe(inv.items.reduce((s, i) => s + i.lost, 0))
  })
  it('is deterministic and shrinks with the period', () => {
    expect(buildInventory(DEFAULT_FILTERS)).toEqual(inv)
    expect(buildInventory({ ...DEFAULT_FILTERS, period: '7d' }).items[0]!.total).toBeLessThan(
      inv.items[0]!.total,
    )
  })
  it('never yields negative quantities on tiny volumes', () => {
    const tiny = buildInventory({ ...DEFAULT_FILTERS, period: '7d', region: 'centro-oeste' })
    for (const item of tiny.items) {
      expect(
        Math.min(item.total, item.available, item.inTransit, item.lost),
      ).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('buildLossTrend', () => {
  it('has one non-negative integer per period label', () => {
    const points = buildLossTrend(DEFAULT_FILTERS)
    expect(points).toHaveLength(12)
    expect(points.every((p) => Number.isInteger(p.value) && p.value >= 0)).toBe(true)
    expect(buildLossTrend({ ...DEFAULT_FILTERS, period: '30d' })).toHaveLength(4)
  })
})
