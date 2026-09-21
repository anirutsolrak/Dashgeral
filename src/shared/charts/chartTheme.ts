export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#ec4899',
] as const

export const ACCENT_HEX = {
  green: '#10b981',
  pink: '#ec4899',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
} as const

export const CHART_CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export const describeData = (data: readonly { label: string; value: number }[], suffix = ''): string =>
  data
    .map((d) => `${d.label}: ${d.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${suffix}`)
    .join(', ')
