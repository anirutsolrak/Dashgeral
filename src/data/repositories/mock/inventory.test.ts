import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockInventoryRepository as repo } from './inventory'

describe('mockInventoryRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('serves overview and loss trend', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).items).toHaveLength(3)
    expect(await repo.getLossTrend(DEFAULT_FILTERS)).toHaveLength(12)
  })
})
