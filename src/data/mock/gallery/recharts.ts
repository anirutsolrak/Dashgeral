import type { RechartsData, SeriesRow } from '@/data/types/gallery'
import { createRng } from '../random'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const CHANNELS = [
  { key: 'agency', label: 'Agência', base: 900 },
  { key: 'digital', label: 'Digital', base: 600 },
  { key: 'phone', label: 'Telefone', base: 400 },
]
const UNITS = [
  { key: 'unitA', label: 'Unidade A' },
  { key: 'unitB', label: 'Unidade B' },
  { key: 'unitC', label: 'Unidade C' },
]
const AXES = ['Prazo', 'Custo', 'Qualidade', 'Cobertura', 'Satisfação']

export function buildRechartsData(): RechartsData {
  const rng = createRng(5001)
  const channelVolume = MONTHS.map((label, i) => {
    const row: SeriesRow = { label }
    for (const c of CHANNELS) row[c.key] = Math.round(c.base * (1 + i * 0.04) * (0.9 + rng.next() * 0.2))
    return row
  })
  const volumeVsTarget = channelVolume.map((row, i): SeriesRow => ({
    label: row.label,
    volume: CHANNELS.reduce((sum, c) => sum + Number(row[c.key]), 0),
    meta: Math.round(1900 * (1 + i * 0.04)),
  }))
  return {
    trend: MONTHS.map((label, i) => ({ label, value: Math.round(1800 * (1 + i * 0.05) * (0.9 + rng.next() * 0.2)) })),
    statusShare: [
      { label: 'Entregue', value: 6200 },
      { label: 'Em trânsito', value: 2100 },
      { label: 'Custódia', value: 640 },
      { label: 'Devolvido', value: 480 },
    ].map((s) => ({ ...s, value: Math.round(s.value * (0.95 + rng.next() * 0.1)) })),
    channels: CHANNELS.map(({ key, label }) => ({ key, label })),
    channelVolume,
    volumeVsTarget,
    units: UNITS.map((u) => ({ ...u })),
    unitPerformance: AXES.map((label) => {
      const row: SeriesRow = { label }
      for (const u of UNITS) row[u.key] = rng.int(55, 98)
      return row
    }),
  }
}
