import { describe, expect, it } from 'vitest'
import { LOGISTICS_CATALOG } from './logistics-catalog'

describe('LOGISTICS_CATALOG', () => {
  it('has the six status groups in display order', () => {
    expect(LOGISTICS_CATALOG.groups.map((g) => g.key)).toEqual([
      'entregue', 'pendente', 'custodia', 'devolvido', 'reenviado', 'sinistrado',
    ])
    expect(LOGISTICS_CATALOG.groups.every((g) => g.steps.length > 0)).toBe(true)
  })
  it('has globally unique step ids', () => {
    const ids = LOGISTICS_CATALOG.groups.flatMap((g) => g.steps.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('offers the two logistics types', () => {
    expect(LOGISTICS_CATALOG.types).toEqual([
      { id: 'flash', label: 'Flash' },
      { id: 'terceiros', label: 'Terceiros' },
    ])
  })
})
