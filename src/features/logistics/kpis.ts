export type LogisticsKpi = 'entregue' | 'pendente' | 'custodia' | 'devolvido'

export const LOG_KPI_META: Record<LogisticsKpi, { title: string; detailsTitle: string }> = {
  entregue: { title: 'Entregues', detailsTitle: 'Entregues - Detalhamento' },
  pendente: { title: 'Em Trânsito', detailsTitle: 'Em Trânsito - Detalhamento' },
  custodia: { title: 'Custódia', detailsTitle: 'Custódia - Detalhamento' },
  devolvido: {
    title: 'Em Processo de Devolução',
    detailsTitle: 'Em Processo de Devolução - Detalhamento',
  },
}
