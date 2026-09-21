import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildOverview } from './overview'

describe('buildOverview', () => {
  it('is deterministic and internally consistent', () => {
    const a = buildOverview(DEFAULT_FILTERS)
    expect(a).toEqual(buildOverview(DEFAULT_FILTERS))
    expect(a.integration.digitized + a.integration.notDigitized).toBeGreaterThan(9000)
    expect(a.accounts.created + a.accounts.notCreated).toBe(a.integration.digitized)
    expect(a.cards.sent + a.cards.notSent).toBe(a.cards.totalAccounts)
    expect(a.cards.totalAccounts).toBe(a.accounts.created)
    expect(a.insurance.withInsurance + a.insurance.withoutInsurance).toBe(a.insurance.total)
    expect(a.integration.ratePercent).toBeGreaterThan(0)
    expect(a.integration.ratePercent).toBeLessThanOrEqual(100)
  })
  it('shrinks with period, region and changes with agreement', () => {
    const all = buildOverview(DEFAULT_FILTERS)
    expect(buildOverview({ ...DEFAULT_FILTERS, period: '7d' }).insurance.total).toBeLessThan(
      all.insurance.total,
    )
    expect(buildOverview({ ...DEFAULT_FILTERS, region: 'sul' }).cards.sent).toBeLessThan(
      all.cards.sent,
    )
    expect(buildOverview({ ...DEFAULT_FILTERS, agreement: 'x' })).not.toEqual(all)
  })
})
