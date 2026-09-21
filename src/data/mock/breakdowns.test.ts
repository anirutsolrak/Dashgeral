import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildAccountReasons, buildInsuranceBreakdown, buildIntegrationReasons } from './breakdowns'
import { buildOverview } from './overview'

const sum = (items: { count: number }[]) => items.reduce((s, i) => s + i.count, 0)

describe('breakdowns tie to the overview', () => {
  const filters = { ...DEFAULT_FILTERS, region: 'sudeste' as const }
  const o = buildOverview(filters)

  it('integration reasons', () => {
    const r = buildIntegrationReasons(filters)
    expect(r.stopReasons).toHaveLength(5)
    expect(sum(r.stopReasons)).toBe(Math.round(o.integration.digitized * 0.2))
    expect(sum(r.nonDigitizedBreakdown)).toBe(o.integration.notDigitized)
  })
  it('account reasons', () => {
    const r = buildAccountReasons(filters)
    expect(sum(r.created)).toBe(o.accounts.created)
    expect(sum(r.notCreated)).toBe(o.accounts.notCreated)
  })
  it('insurance breakdown', () => {
    const b = buildInsuranceBreakdown(filters)
    expect(sum(b.byCoverage)).toBe(o.insurance.total)
    expect(sum(b.byValue)).toBe(o.insurance.withInsurance)
    expect(sum(b.byAssignment)).toBe(b.byValue[0]?.count)
  })
  it('is deterministic', () => {
    expect(buildInsuranceBreakdown(filters)).toEqual(buildInsuranceBreakdown(filters))
  })
})
