export type InventoryKpi = 'cards' | 'envelopes' | 'letters' | 'losses'

export const INV_KPI_META: Record<InventoryKpi, { title: string; detailsTitle: string }> = {
  cards: { title: 'Cartões', detailsTitle: 'Cartões - Detalhamento' },
  envelopes: { title: 'Envelopes', detailsTitle: 'Envelopes - Detalhamento' },
  letters: { title: 'Cartas Berço', detailsTitle: 'Cartas Berço - Detalhamento' },
  losses: { title: 'Perdas Totais', detailsTitle: 'Perdas Totais - Detalhamento' },
}
