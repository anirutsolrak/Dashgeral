import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildInventory } from '@/data/mock/inventory'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { InventoryDetails } from './InventoryDetails'

const inv = buildInventory(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('InventoryDetails', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('item: pie of the stock split and a status table that adds up to the total', async () => {
    renderWithProviders(<InventoryDetails kpi="envelopes" />, { url })
    expect(
      await screen.findByRole('heading', { name: 'Distribuição de Envelopes' }),
    ).toBeInTheDocument()
    const table = await screen.findByRole('table', { name: 'Status de Envelopes' })
    const item = inv.items[1]!
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getAllByRole('cell')[0]?.textContent)).toEqual([
      'Disponíveis',
      'Em trânsito',
      'Perdidos',
    ])
    expect(within(rows[0]!).getByText(formatNumber(item.available))).toBeInTheDocument()
  })

  it('losses: bar of losses per item and the total', async () => {
    renderWithProviders(<InventoryDetails kpi="losses" />, { url })
    expect(await screen.findByRole('heading', { name: 'Perdas por item' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: new RegExp(`Cartões: ${formatNumber(inv.items[0]!.lost)}`) }),
    ).toBeInTheDocument()
    expect(screen.getByText('Total de perdas')).toBeInTheDocument()
    expect(screen.getByText(formatNumber(inv.totalLost))).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<InventoryDetails kpi="cards" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
