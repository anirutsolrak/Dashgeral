import { describe, expect, it } from 'vitest'
import { buildEchartsData } from '@/data/mock/gallery/echarts'
import { chartPalette } from '@/shared/echarts/palette'
import { funnelOption, gaugeOption, heatmapOption, sankeyOption, treemapOption } from './options'

const d = buildEchartsData()
const light = chartPalette('light')
const dark = chartPalette('dark')

interface Loose {
  series: { type: string; data?: unknown[]; links?: unknown[]; max?: number }[]
  textStyle: { color: string }
  visualMap?: { max: number }
}
const loose = (o: unknown) => o as Loose

describe('ECharts option builders', () => {
  it('build one series of the expected type each', () => {
    expect(loose(heatmapOption(d.heatmap, light)).series[0]!.type).toBe('heatmap')
    expect(loose(funnelOption(d.funnel, light)).series[0]!.type).toBe('funnel')
    expect(loose(gaugeOption(d.gauge, light)).series[0]!.type).toBe('gauge')
    expect(loose(treemapOption(d.treemap, light)).series[0]!.type).toBe('treemap')
    expect(loose(sankeyOption(d.sankey, light)).series[0]!.type).toBe('sankey')
  })

  it('pass the data through', () => {
    expect(loose(heatmapOption(d.heatmap, light)).series[0]!.data).toHaveLength(d.heatmap.cells.length)
    expect(loose(funnelOption(d.funnel, light)).series[0]!.data).toHaveLength(d.funnel.length)
    expect(loose(sankeyOption(d.sankey, light)).series[0]!.links).toHaveLength(d.sankey.links.length)
    expect(loose(gaugeOption(d.gauge, light)).series[0]!.max).toBe(d.gauge.max)
  })

  it('scale the heatmap colour range to the largest cell', () => {
    const max = Math.max(...d.heatmap.cells.map((c) => c[2]))
    expect(loose(heatmapOption(d.heatmap, light)).visualMap!.max).toBe(max)
  })

  it('keeps the heatmap colour range finite for an empty grid', () => {
    const empty = { days: [], hours: [], cells: [] }
    expect(loose(heatmapOption(empty, light)).visualMap!.max).toBe(0)
  })

  it('follow the palette of the theme', () => {
    expect(loose(funnelOption(d.funnel, light)).textStyle.color).toBe(light.text)
    expect(loose(funnelOption(d.funnel, dark)).textStyle.color).toBe(dark.text)
  })
})
