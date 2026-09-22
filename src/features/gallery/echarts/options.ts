import type { GaugeData, HeatmapData, LabelValue, SankeyData, TreeNode } from '@/data/types/gallery'
import type { EChartsOption } from '@/shared/echarts/core'
import { themeBase, tooltipStyle, type EChartPalette } from '@/shared/echarts/palette'

export const heatmapOption = (d: HeatmapData, p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), position: 'top' },
  grid: { left: 48, right: 24, top: 16, bottom: 72 },
  xAxis: { type: 'category', data: d.hours, splitArea: { show: true } },
  yAxis: { type: 'category', data: d.days, inverse: true, splitArea: { show: true } },
  visualMap: {
    min: 0,
    max: Math.max(0, ...d.cells.map((c) => c[2])),
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 8,
    inRange: { color: ['#dbe7fb', '#2a78d6', '#142f5e'] },
    textStyle: { color: p.text },
  },
  series: [{ type: 'heatmap', data: d.cells, label: { show: false } }],
})

export const funnelOption = (d: LabelValue[], p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), trigger: 'item' },
  series: [
    {
      type: 'funnel',
      left: '10%',
      width: '80%',
      top: 16,
      bottom: 16,
      sort: 'descending',
      gap: 2,
      label: { show: true, position: 'inside', formatter: '{b}: {c}', color: '#ffffff' },
      data: d.map((s) => ({ name: s.label, value: s.value })),
    },
  ],
})

export const gaugeOption = (d: GaugeData, p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  series: [
    {
      type: 'gauge',
      min: 0,
      max: d.max,
      progress: { show: true, width: 14 },
      axisLine: { lineStyle: { width: 14 } },
      axisLabel: { color: p.text },
      title: { color: p.text },
      detail: { valueAnimation: true, formatter: '{value}%', color: p.text, fontSize: 28 },
      data: [{ value: d.value, name: d.label }],
    },
  ],
})

export const treemapOption = (d: TreeNode[], p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), trigger: 'item' },
  series: [
    {
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: { show: true, formatter: '{b}' },
      upperLabel: { show: true, height: 22 },
      data: d,
    },
  ],
})

export const sankeyOption = (d: SankeyData, p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), trigger: 'item' },
  series: [
    {
      type: 'sankey',
      left: 16,
      right: 96,
      top: 16,
      bottom: 16,
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { color: p.text },
      data: d.nodes,
      links: d.links,
    },
  ],
})
