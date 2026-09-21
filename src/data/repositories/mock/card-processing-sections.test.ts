import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockCardProcessingRepository as repo } from './card-processing'

describe('mockCardProcessingRepository sections', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('serves every section', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).integration.digitized).toBeGreaterThan(0)
    expect(await repo.getIntegrationTrend(DEFAULT_FILTERS)).toHaveLength(12)
    expect((await repo.getIntegrationReasons(DEFAULT_FILTERS)).stopReasons.length).toBeGreaterThan(0)
    expect((await repo.getAccountReasons(DEFAULT_FILTERS)).notCreated.length).toBeGreaterThan(0)
    expect((await repo.getInsuranceBreakdown(DEFAULT_FILTERS)).byValue).toHaveLength(2)
    expect((await repo.getWorkflow('cards')).flow.length).toBe(5)
  })
})
