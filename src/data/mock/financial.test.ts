import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildFinancialOverview, buildUnlockByRegion, buildUsageEvolution } from './financial'
import { buildOverview } from './overview'

describe('buildFinancialOverview', () => {
  const o = buildFinancialOverview(DEFAULT_FILTERS)

  it('keeps ranges, limit usage and costs consistent', () => {
    expect(o.usageByRange).toHaveLength(4)
    expect(o.usageByRange.reduce((s, r) => s + r.customers, 0)).toBe(o.limitUsage.customers)
    expect(o.usageByRange.reduce((s, r) => s + r.percent, 0)).toBeCloseTo(100, 5)
    const used = o.usageByRange.reduce((s, r) => s + r.customers * r.average, 0)
    expect(o.limitUsage.usedAmount).toBe(used)
    expect(o.limitUsage.ratePercent).toBeGreaterThan(0)
    expect(o.limitUsage.ratePercent).toBeLessThan(100)
    expect(o.logistics.byStatus).toHaveLength(5)
    expect(o.logistics.byStatus.reduce((s, c) => s + c.count, 0)).toBe(
      buildOverview(DEFAULT_FILTERS).cards.sent,
    )
    expect(o.logistics.totalAmount).toBe(o.logistics.byStatus.reduce((s, c) => s + c.amount, 0))
    expect(o.logistics.unitTotal).toBe(40)
  })
  it('is deterministic and shrinks with the period', () => {
    expect(buildFinancialOverview(DEFAULT_FILTERS)).toEqual(o)
    expect(
      buildFinancialOverview({ ...DEFAULT_FILTERS, period: '7d' }).limitUsage.customers,
    ).toBeLessThan(o.limitUsage.customers)
  })
  it('never divides by zero on tiny volumes', () => {
    const tiny = buildFinancialOverview({
      ...DEFAULT_FILTERS,
      period: '7d',
      region: 'centro-oeste',
    })
    expect(Number.isFinite(tiny.limitUsage.averageUsage)).toBe(true)
    expect(Number.isFinite(tiny.limitUsage.ratePercent)).toBe(true)
  })
})

describe('buildUnlockByRegion', () => {
  it('returns the five regions with coordinates, or only the selected one', () => {
    const all = buildUnlockByRegion(DEFAULT_FILTERS)
    expect(all.map((r) => r.region)).toEqual([
      'norte',
      'nordeste',
      'sudeste',
      'sul',
      'centro-oeste',
    ])
    expect(all.every((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))).toBe(true)
    expect(buildUnlockByRegion({ ...DEFAULT_FILTERS, region: 'sul' }).map((r) => r.region)).toEqual(
      ['sul'],
    )
  })
  it('shrinks with the period', () => {
    const week = buildUnlockByRegion({ ...DEFAULT_FILTERS, period: '7d' })
    expect(week[0]!.unlocked).toBeLessThan(buildUnlockByRegion(DEFAULT_FILTERS)[0]!.unlocked)
  })
})

describe('buildUsageEvolution', () => {
  it('has one non-negative point per period label', () => {
    const points = buildUsageEvolution(DEFAULT_FILTERS)
    expect(points).toHaveLength(12)
    expect(points.every((p) => p.value >= 0)).toBe(true)
    expect(buildUsageEvolution({ ...DEFAULT_FILTERS, period: '7d' })).toHaveLength(7)
  })
})
