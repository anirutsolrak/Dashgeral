import { describe, expect, it } from 'vitest'
import { toPercentages } from './percent'

describe('toPercentages', () => {
  it('computes each share in percentage points', () => {
    const result = toPercentages([
      { label: 'A', value: 1 },
      { label: 'B', value: 3 },
    ])
    expect(result.map((r) => r.percent)).toEqual([25, 75])
    expect(result[0]?.label).toBe('A')
  })
  it('returns 0 when the total is 0', () => {
    expect(toPercentages([{ label: 'A', value: 0 }])[0]?.percent).toBe(0)
  })
})
