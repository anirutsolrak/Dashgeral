import { describe, expect, it } from 'vitest'
import { formatCompact, formatCurrency, formatNumber, formatPercentage } from './formatters'

// eslint-disable-next-line no-irregular-whitespace
const nbsp = (s: string) => s.replace(/ /g, ' ')

describe('formatters', () => {
  it('formats BRL currency', () => {
    expect(nbsp(formatCurrency(1234.5))).toBe('R$ 1.234,50')
  })
  it('formats integers with pt-BR grouping', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })
  it('formats compact numbers', () => {
    expect(nbsp(formatCompact(1500))).toBe('1,5 mil')
  })
  it('formats percentage given in percentage points', () => {
    expect(formatPercentage(80)).toBe('80,00%')
    expect(formatPercentage(92.456, 1)).toBe('92,5%')
  })
  it('returns N/A for non numeric input', () => {
    expect(formatPercentage(undefined)).toBe('N/A')
    expect(formatPercentage(null)).toBe('N/A')
    expect(formatPercentage(Number.NaN)).toBe('N/A')
  })
})
