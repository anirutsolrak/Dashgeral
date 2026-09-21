import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildLogistics, buildLogisticsTrend, buildTypeComparison } from './logistics'

describe('buildLogistics', () => {
  const overview = buildLogistics(DEFAULT_FILTERS)

  it('is consistent: steps sum to groups, groups sum to total, percents sum to 100', () => {
    expect(overview.groups.map((g) => g.key)).toEqual([
      'entregue',
      'pendente',
      'custodia',
      'devolvido',
      'reenviado',
      'sinistrado',
    ])
    for (const group of overview.groups) {
      expect(group.count).toBe(group.steps.reduce((s, x) => s + x.count, 0))
    }
    expect(overview.total).toBe(overview.groups.reduce((s, g) => s + g.count, 0))
    const percentSum = overview.groups.reduce((s, g) => s + g.percent, 0)
    expect(percentSum).toBeCloseTo(100, 5)
    expect(overview.groups[0]!.count).toBeGreaterThan(overview.groups[1]!.count)
  })

  it('is deterministic and shrinks with the period', () => {
    expect(buildLogistics(DEFAULT_FILTERS)).toEqual(overview)
    expect(buildLogistics({ ...DEFAULT_FILTERS, period: '7d' }).total).toBeLessThan(overview.total)
  })

  it('scales with the logistics type', () => {
    const flash = buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'flash' }).total
    const third = buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'terceiros' }).total
    expect(flash).toBeLessThan(overview.total)
    expect(third).toBeLessThan(flash)
    expect(buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'inexistente' })).toEqual(overview)
  })

  it('keeps only the selected step and ignores unknown steps', () => {
    const one = buildLogistics({ ...DEFAULT_FILTERS, logisticsStep: 'custodia-devolvido' })
    const custody = one.groups.find((g) => g.key === 'custodia')!
    expect(one.total).toBeGreaterThan(0)
    expect(one.total).toBe(custody.count)
    expect(one.groups.filter((g) => g.count > 0).map((g) => g.key)).toEqual(['custodia'])
    expect(buildLogistics({ ...DEFAULT_FILTERS, logisticsStep: 'xyz' })).toEqual(overview)
  })

  it('never yields negative counts or NaN percents on tiny volumes', () => {
    const tiny = buildLogistics({
      ...DEFAULT_FILTERS,
      period: '7d',
      region: 'centro-oeste',
      logisticsType: 'terceiros',
    })
    for (const group of tiny.groups) {
      expect(group.count).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(group.percent)).toBe(true)
    }
  })
})

describe('buildLogisticsTrend', () => {
  it('has one non-negative integer per period label', () => {
    const points = buildLogisticsTrend(DEFAULT_FILTERS)
    expect(points).toHaveLength(12)
    expect(points.every((p) => Number.isInteger(p.value) && p.value >= 0)).toBe(true)
    expect(buildLogisticsTrend({ ...DEFAULT_FILTERS, period: '30d' })).toHaveLength(4)
  })
})

describe('buildTypeComparison', () => {
  it('has one row per group with Flash at least as large as Terceiros', () => {
    const rows = buildTypeComparison(DEFAULT_FILTERS)
    expect(rows).toHaveLength(6)
    expect(rows[0]).toMatchObject({ key: 'entregue', label: 'Entregue' })
    for (const row of rows) expect(row.flash).toBeGreaterThanOrEqual(row.terceiros)
  })
})
