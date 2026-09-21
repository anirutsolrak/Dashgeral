import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { createRng } from './random'
import { pct, seedFor, splitByWeights, volumeFactor } from './scale'

describe('volumeFactor', () => {
  it('is 1 for default filters and shrinks with period and region', () => {
    expect(volumeFactor(DEFAULT_FILTERS)).toBe(1)
    expect(volumeFactor({ ...DEFAULT_FILTERS, period: '7d' })).toBeLessThan(1)
    expect(volumeFactor({ ...DEFAULT_FILTERS, period: '7d', region: 'sul' })).toBeLessThan(
      volumeFactor({ ...DEFAULT_FILTERS, period: '7d' }),
    )
  })
})

describe('seedFor', () => {
  it('is stable and depends on salt and agreement', () => {
    expect(seedFor(DEFAULT_FILTERS, 'a')).toBe(seedFor(DEFAULT_FILTERS, 'a'))
    expect(seedFor(DEFAULT_FILTERS, 'a')).not.toBe(seedFor(DEFAULT_FILTERS, 'b'))
    expect(seedFor({ ...DEFAULT_FILTERS, agreement: 'x' }, 'a')).not.toBe(seedFor(DEFAULT_FILTERS, 'a'))
  })
})

describe('pct', () => {
  it('computes a percentage and guards division by zero', () => {
    expect(pct(1, 4)).toBe(25)
    expect(pct(1, 0)).toBe(0)
  })
})

describe('splitByWeights', () => {
  const reasons = ['A', 'B', 'C', 'D'] as const
  it('splits exactly the total across all reasons, never negative', () => {
    const parts = splitByWeights(1000, reasons, createRng(3))
    expect(parts.map((p) => p.reason)).toEqual([...reasons])
    expect(parts.reduce((sum, p) => sum + p.count, 0)).toBe(1000)
    expect(parts.every((p) => p.count >= 0)).toBe(true)
  })
  it('is deterministic for the same seed and handles zero', () => {
    expect(splitByWeights(50, reasons, createRng(9))).toEqual(splitByWeights(50, reasons, createRng(9)))
    expect(splitByWeights(0, reasons, createRng(9)).every((p) => p.count === 0)).toBe(true)
  })
})
