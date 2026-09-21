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
})
