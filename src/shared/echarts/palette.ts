import { CHART_COLORS } from '@/shared/charts/chartTheme'
import type { EChartsOption } from './core'

export interface EChartPalette {
  text: string
  grid: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  series: readonly string[]
}

const LIGHT: EChartPalette = {
  text: '#64748b', grid: '#e2e8f0', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0', tooltipText: '#0f172a', series: CHART_COLORS,
}
const DARK: EChartPalette = {
  text: '#94a3b8', grid: '#334155', tooltipBg: '#1e293b', tooltipBorder: '#334155', tooltipText: '#f1f5f9', series: CHART_COLORS,
}

export const chartPalette = (theme: 'light' | 'dark'): EChartPalette => (theme === 'dark' ? DARK : LIGHT)

export const tooltipStyle = (p: EChartPalette) => ({
  backgroundColor: p.tooltipBg,
  borderColor: p.tooltipBorder,
  textStyle: { color: p.tooltipText },
})

export const themeBase = (p: EChartPalette): EChartsOption => ({
  backgroundColor: 'transparent',
  color: [...p.series],
  textStyle: { color: p.text },
  tooltip: tooltipStyle(p),
  aria: { enabled: true },
})
