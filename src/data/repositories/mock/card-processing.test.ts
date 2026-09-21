import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockCardProcessingRepository } from './card-processing'

describe('mockCardProcessingRepository', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/?delay=0')
  })

  it('is deterministic for identical filters', async () => {
    const a = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    const b = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    expect(a).toEqual(b)
  })

  it('applies the period filter to volumes', async () => {
    const all = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    const week = await mockCardProcessingRepository.getKpis({ ...DEFAULT_FILTERS, period: '7d' })
    expect(week.totalProposals).toBeLessThan(all.totalProposals)
  })

  it('applies the region filter to volumes', async () => {
    const all = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    const sul = await mockCardProcessingRepository.getKpis({ ...DEFAULT_FILTERS, region: 'sul' })
    expect(sul.totalProposals).toBeLessThan(all.totalProposals)
  })

  it('keeps the integration rate between 0 and 100', async () => {
    const { integrationRate } = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    expect(integrationRate).toBeGreaterThanOrEqual(0)
    expect(integrationRate).toBeLessThanOrEqual(100)
  })
})
