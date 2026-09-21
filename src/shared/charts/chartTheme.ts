import { formatNumber } from '@/shared/lib/formatters'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#ec4899',
] as const

export const ACCENT_HEX = {
  green: '#10b981',
  pink: '#ec4899',
  red: '#ef4444',
  purple: '#a855f7',
} as const

// Cores dependem do tema via variáveis CSS definidas em index.css (:root e .dark).
export const AXIS_TICK = { fill: 'var(--chart-text)' } as const
export const LEGEND_LABEL_STYLE = { color: 'var(--chart-text)' } as const
export const GRID_STROKE = 'var(--chart-grid)'
export const TOOLTIP_STYLE = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  color: 'var(--chart-tooltip-text)',
} as const

export const CHART_CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export const describeData = (data: readonly { label: string; value: number }[], suffix = ''): string =>
  data
    .map((d) => `${d.label}: ${d.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${suffix}`)
    .join(', ')

export const describeSeries = (series: GroupedSeries[], data: GroupedDatum[]): string =>
  data
    .map((row) => {
      const values = series.map((s) => `${s.label} ${formatNumber(Number(row[s.key] ?? 0))}`)
      return `${row.label}: ${values.join(', ')}`
    })
    .join('; ')
