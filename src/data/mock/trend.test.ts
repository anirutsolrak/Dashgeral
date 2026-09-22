import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildTrend, periodLabels } from './trend'

describe('buildTrend', () => {
  it.each([
    ['all', 12],
    ['12m', 12],
    ['90d', 3],
    ['30d', 4],
    ['7d', 7],
  ] as const)('has the expected number of points for %s', (period, length) => {
    expect(buildTrend({ ...DEFAULT_FILTERS, period })).toHaveLength(length)
  })
  it('keeps values between 0 and 100 and is deterministic', () => {
    const points = buildTrend(DEFAULT_FILTERS)
    expect(points.every((p) => p.value >= 0 && p.value <= 100)).toBe(true)
    expect(points).toEqual(buildTrend(DEFAULT_FILTERS))
  })
})

describe('periodLabels', () => {
  it('returns the labels used by the trend', () => {
    expect(periodLabels({ ...DEFAULT_FILTERS, period: '30d' })).toEqual([
      'Sem 1',
      'Sem 2',
      'Sem 3',
      'Sem 4',
    ])
    expect(periodLabels(DEFAULT_FILTERS)).toHaveLength(12)
    expect(periodLabels({ ...DEFAULT_FILTERS, period: '7d' })[0]).toBe('Seg')
  })
})
