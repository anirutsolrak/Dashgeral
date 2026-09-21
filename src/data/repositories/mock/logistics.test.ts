import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockLogisticsRepository as repo } from './logistics'

describe('mockLogisticsRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('serves overview, trend, type comparison and catalog', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).groups).toHaveLength(6)
    expect(await repo.getTrend(DEFAULT_FILTERS)).toHaveLength(12)
    expect(await repo.getTypeComparison(DEFAULT_FILTERS)).toHaveLength(6)
    expect((await repo.getCatalog()).types).toHaveLength(2)
  })

  it('fails on demand with ?error=1', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await expect(repo.getOverview(DEFAULT_FILTERS)).rejects.toThrow('Falha simulada')
  })
})
