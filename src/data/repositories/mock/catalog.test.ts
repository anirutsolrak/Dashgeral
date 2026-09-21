import { beforeEach, describe, expect, it } from 'vitest'
import { mockCatalogRepository } from './catalog'

describe('mockCatalogRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('returns categories with unique agreement ids', async () => {
    const { categories } = await mockCatalogRepository.getAgreementCatalog()
    expect(categories.map((c) => c.id)).toEqual(['governo', 'inss', 'prefeitura'])
    const ids = categories.flatMap((c) => c.agreements.map((a) => a.id))
    expect(ids.length).toBeGreaterThanOrEqual(6)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('returns an independent copy on each call', async () => {
    const first = await mockCatalogRepository.getAgreementCatalog()
    first.categories[0]!.label = 'ALTERADO'
    first.categories.pop()
    const second = await mockCatalogRepository.getAgreementCatalog()
    expect(second.categories[0]!.label).toBe('Governo')
    expect(second.categories).toHaveLength(3)
  })
})
