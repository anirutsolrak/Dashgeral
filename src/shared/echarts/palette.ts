import type { EChartsOption } from './core'

export interface EChartPalette {
  text: string
  grid: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  series: readonly string[]
}

const LIGHT_SERIES = ['#2a78d6', '#1baf7a', '#eda100', '#d03b3b', '#94a3b8'] as const
const DARK_SERIES = ['#3987e5', '#199e70', '#a88500', '#e66767', '#64748b'] as const

const LIGHT: EChartPalette = {
  text: '#64748b',
  grid: '#e2e8f0',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#0f172a',
  series: LIGHT_SERIES,
}
const DARK: EChartPalette = {
  text: '#94a3b8',
  grid: '#334155',
  tooltipBg: '#1e293b',
  tooltipBorder: '#334155',
  tooltipText: '#f1f5f9',
  series: DARK_SERIES,
}

export const chartPalette = (theme: 'light' | 'dark'): EChartPalette =>
  theme === 'dark' ? DARK : LIGHT

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
