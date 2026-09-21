import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockFinancialRepository as repo } from './financial'

describe('mockFinancialRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('serves every section', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).usageByRange).toHaveLength(4)
    expect(await repo.getUnlockByRegion(DEFAULT_FILTERS)).toHaveLength(5)
    expect(await repo.getUsageEvolution(DEFAULT_FILTERS)).toHaveLength(12)
  })
})
