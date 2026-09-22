const locale = 'pt-BR'

const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' })
const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'long' })

export const formatCurrency = (value: number): string => currency.format(value)
export const formatNumber = (value: number): string => integer.format(value)
export const formatCompact = (value: number): string => compact.format(value)

export function formatPercentage(value: number | null | undefined, fractionDigits = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A'
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)}%`
}
