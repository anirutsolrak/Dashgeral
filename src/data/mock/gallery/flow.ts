import type { FlowData, Graph } from '@/data/types/gallery'
import { createRng } from '../random'

const STEPS = ['Pedido recebido', 'Separação', 'Postagem', 'Transporte', 'Entrega', 'Confirmação']

const chain = (ids: string[]): Graph['edges'] =>
  ids.slice(1).map((target, i) => ({ id: `${ids[i]}-${target}`, source: ids[i]!, target }))

export function buildFlowData(): FlowData {
  const rng = createRng(5005)
  const status = () => rng.pick(['ok', 'ok', 'ok', 'warning', 'error'] as const)
  const ids = ['coleta', 'triagem', 'transferencia', 'distribuicao', 'entrega']
  return {
    steps: STEPS.map((label, i) => ({ id: `s${i}`, label })),
    org: {
      id: 'dir', name: 'Diretor de Logística', role: 'Diretoria',
      children: [
        {
          id: 'transp', name: 'Coordenador de Transporte', role: 'Coordenação',
          children: [
            { id: 'rotas', name: 'Analista de Rotas', role: 'Equipe', children: [] },
            { id: 'frota', name: 'Analista de Frota', role: 'Equipe', children: [] },
          ],
        },
        {
          id: 'estq', name: 'Coordenador de Estoque', role: 'Coordenação',
          children: [
            { id: 'conf', name: 'Conferente', role: 'Equipe', children: [] },
            { id: 'cust', name: 'Analista de Custódia', role: 'Equipe', children: [] },
          ],
        },
      ],
    },
    pipeline: {
      nodes: ids.map((id, i) => ({ id, label: id[0]!.toUpperCase() + id.slice(1), status: status(), x: i * 220, y: (i % 2) * 90 })),
      edges: chain(ids),
    },
    decision: {
      nodes: [
        { id: 'inicio', label: 'Objeto recebido', x: 0, y: 90 },
        { id: 'valido', label: 'Endereço válido?', x: 240, y: 90 },
        { id: 'rota', label: 'Segue para rota', x: 500, y: 0 },
        { id: 'cust', label: 'Custódia', x: 500, y: 180 },
        { id: 'tentativa', label: 'Nova tentativa?', x: 760, y: 180 },
      ],
      edges: [
        { id: 'a', source: 'inicio', target: 'valido' },
        { id: 'b', source: 'valido', target: 'rota', label: 'Sim' },
        { id: 'c', source: 'valido', target: 'cust', label: 'Não' },
        { id: 'd', source: 'cust', target: 'tentativa' },
      ],
    },
  }
}
