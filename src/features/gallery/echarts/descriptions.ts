import type { GaugeData, HeatmapData, LabelValue, SankeyData, TreeNode } from '@/data/types/gallery'
import { formatNumber } from '@/shared/lib/formatters'

export function describeHeatmap(d: HeatmapData): string {
  const sorted = [...d.cells].sort((a, b) => b[2] - a[2])
  const slot = (cell: [number, number, number] | undefined) =>
    cell ? `${d.days[cell[1]]} às ${d.hours[cell[0]]} (${formatNumber(cell[2])})` : 'sem dados'
  return `Maior volume: ${slot(sorted[0])}. Menor volume: ${slot(sorted[sorted.length - 1])}.`
}

export const describeFunnel = (d: LabelValue[]): string =>
  d.map((s) => `${s.label}: ${formatNumber(s.value)}`).join('; ')

export const describeGauge = (d: GaugeData): string => `${d.label}: ${d.value} de ${d.max}`

const total = (node: TreeNode): number =>
  node.children ? node.children.reduce((sum, c) => sum + total(c), 0) : (node.value ?? 0)

export const describeTreemap = (d: TreeNode[]): string =>
  d.map((n) => `${n.name}: ${formatNumber(total(n))}`).join('; ')

export const describeSankey = (d: SankeyData): string =>
  d.links.map((l) => `${l.source} para ${l.target}: ${formatNumber(l.value)}`).join('; ')
