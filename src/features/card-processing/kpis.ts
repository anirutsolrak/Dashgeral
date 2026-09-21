import type { WorkflowKpi } from '@/data/types/card-processing'

export type WorkflowView = 'flowchart' | 'orgchart' | 'docs'

export const KPI_META: Record<WorkflowKpi, { title: string; detailsTitle: string; area: string }> = {
  integration: { title: 'Taxa de Integração', detailsTitle: 'Taxa de Integração - Detalhamento', area: 'Operações' },
  accounts: { title: 'Contas Criadas', detailsTitle: 'Contas Criadas e Não Criadas - Detalhamento', area: 'Criação de Contas' },
  cards: { title: 'Cartões Enviados', detailsTitle: 'Cartões Enviados - Detalhamento', area: 'Envio de Cartões' },
  insurance: { title: 'Propostas com Seguro', detailsTitle: 'Propostas com Seguro - Detalhamento', area: 'Seguros' },
}

export const VIEW_LABEL: Record<WorkflowView, string> = {
  flowchart: 'Fluxograma',
  orgchart: 'Organograma',
  docs: 'POPs',
}
