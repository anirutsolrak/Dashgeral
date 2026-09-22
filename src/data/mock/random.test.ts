import { describe, expect, it } from 'vitest'
import { createRng } from './random'

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
  })
  it('differs across seeds', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next())
  })
  it('int stays inside the inclusive range', () => {
    const rng = createRng(7)
    for (let i = 0; i < 500; i++) {
      const n = rng.int(3, 6)
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(6)
    }
  })
  it('pick returns an element of the list', () => {
    const items = ['a', 'b', 'c'] as const
    expect(items).toContain(createRng(9).pick(items))
  })
})
