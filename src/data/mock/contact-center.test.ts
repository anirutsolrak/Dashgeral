import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import {
  buildContactCenter,
  buildHourly,
  buildOperators,
  buildRegionCalls,
  buildTabulations,
} from './contact-center'

describe('buildContactCenter', () => {
  const o = buildContactCenter(DEFAULT_FILTERS)

  it('fecha as contas entre atendidas, abandonadas e tabulações', () => {
    expect(o.attended + o.abandoned).toBe(o.total)
    expect(o.confirmed + o.notEffective).toBeLessThanOrEqual(o.attended)
    expect(o.avgHandleSeconds).toBeGreaterThan(0)
    expect(o.lostSeconds).toBeGreaterThan(0)
  })
  it('é determinístico e encolhe com o período', () => {
    expect(buildContactCenter(DEFAULT_FILTERS)).toEqual(o)
    expect(buildContactCenter({ ...DEFAULT_FILTERS, period: '7d' }).total).toBeLessThan(o.total)
  })
  it('não gera números negativos em volumes pequenos', () => {
    const tiny = buildContactCenter({ ...DEFAULT_FILTERS, period: '7d', region: 'centro-oeste' })
    expect(Math.min(...Object.values(tiny))).toBeGreaterThanOrEqual(0)
  })
})

describe('séries derivadas', () => {
  const o = buildContactCenter(DEFAULT_FILTERS)

  it('tabulações somam as ligações atendidas e incluem as confirmadas', () => {
    const tabs = buildTabulations(DEFAULT_FILTERS)
    expect(tabs.reduce((s, t) => s + t.value, 0)).toBe(o.attended)
    expect(tabs.find((t) => t.label === 'Endereço confirmado')?.value).toBe(o.confirmed)
  })
  it('a distribuição por hora soma o total do dia útil', () => {
    const hours = buildHourly(DEFAULT_FILTERS)
    expect(hours[0]?.label).toBe('08h')
    expect(hours.reduce((s, h) => s + h.attended, 0)).toBe(o.attended)
    expect(hours.reduce((s, h) => s + h.abandoned, 0)).toBe(o.abandoned)
  })
  it('operadores e regiões somam o total de ligações', () => {
    const ops = buildOperators(DEFAULT_FILTERS)
    expect(ops.reduce((s, op) => s + op.calls, 0)).toBe(o.total)
    expect(ops.every((op) => op.confirmed <= op.calls)).toBe(true)
    const regions = buildRegionCalls(DEFAULT_FILTERS)
    expect(regions.map((r) => r.region)).toEqual([
      'norte',
      'nordeste',
      'centro-oeste',
      'sudeste',
      'sul',
    ])
    expect(regions.reduce((s, r) => s + r.calls, 0)).toBe(o.total)
  })
})
