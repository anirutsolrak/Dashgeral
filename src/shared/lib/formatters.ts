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

/** Segundos em m:ss, ou h:mm:ss a partir de uma hora. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}
