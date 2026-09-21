export type FinancialKpi = 'usage' | 'total' | 'average' | 'logistics'

export const FIN_KPI_META: Record<FinancialKpi, { title: string; detailsTitle: string }> = {
  usage: { title: 'Taxa de Utilização', detailsTitle: 'Detalhamento - Utilização do Limite' },
  total: { title: 'Valor Total Utilizado', detailsTitle: 'Detalhamento - Distribuição de Utilização' },
  average: { title: 'Média de Uso', detailsTitle: 'Detalhamento - Média de Uso por Cliente' },
  logistics: { title: 'Custos Logísticos', detailsTitle: 'Detalhamento - Custos Logísticos' },
}
