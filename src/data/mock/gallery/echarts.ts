import type { EchartsData, TreeNode } from '@/data/types/gallery'
import { createRng, type Rng } from '../random'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}h`)
const FUNNEL = [
  'Propostas recebidas',
  'Digitadas',
  'Contas criadas',
  'Cartões enviados',
  'Cartões entregues',
]

const leaf = (rng: Rng, name: string): TreeNode => ({ name, value: rng.int(20, 200) })

export function buildEchartsData(): EchartsData {
  const rng = createRng(5002)
  let stage = 1000
  return {
    heatmap: {
      days: [...DAYS],
      hours: [...HOURS],
      cells: DAYS.flatMap((_, y) =>
        HOURS.map((_, x): [number, number, number] => {
          const peak = Math.max(0, 1 - Math.abs(x - 3) / 6) + Math.max(0, 1 - Math.abs(x - 8) / 6)
          const weekend = y >= 5 ? 0.3 : 1
          return [x, y, Math.round(20 + peak * 60 * weekend * (0.8 + rng.next() * 0.4))]
        }),
      ),
    },
    funnel: FUNNEL.map((label, i) => {
      if (i > 0) stage = Math.round(stage * (0.82 + rng.next() * 0.1))
      return { label, value: stage }
    }),
    gauge: { label: 'SLA de entrega (%)', value: rng.int(90, 98), max: 100 },
    treemap: [
      {
        name: 'Transporte',
        children: [leaf(rng, 'Flash'), leaf(rng, 'Terceiros A'), leaf(rng, 'Terceiros B')],
      },
      { name: 'Armazenagem', children: [leaf(rng, 'Estoque'), leaf(rng, 'Custódia')] },
      {
        name: 'Materiais',
        children: [leaf(rng, 'Cartões'), leaf(rng, 'Envelopes'), leaf(rng, 'Cartas berço')],
      },
    ],
    sankey: {
      nodes: ['Postado', 'Em trânsito', 'Entregue', 'Custódia', 'Devolvido', 'Reenviado'].map(
        (name) => ({ name }),
      ),
      links: [
        { source: 'Postado', target: 'Em trânsito', value: rng.int(900, 1000) },
        { source: 'Em trânsito', target: 'Entregue', value: rng.int(700, 800) },
        { source: 'Em trânsito', target: 'Custódia', value: rng.int(120, 200) },
        { source: 'Custódia', target: 'Devolvido', value: rng.int(50, 90) },
        { source: 'Custódia', target: 'Reenviado', value: rng.int(40, 80) },
        { source: 'Reenviado', target: 'Entregue', value: rng.int(20, 39) },
      ],
    },
  }
}
