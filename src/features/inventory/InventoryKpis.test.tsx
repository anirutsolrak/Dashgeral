import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildInventory } from '@/data/mock/inventory'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { InventoryKpis } from './InventoryKpis'

const inv = buildInventory(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('InventoryKpis', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the three stock items and the total losses', async () => {
    renderWithProviders(<InventoryKpis onSelect={vi.fn()} />, { url })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    const cardsItem = inv.items[0]!
    expect(within(cards[0]!).getByText('Cartões')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatNumber(cardsItem.total))).toBeInTheDocument()
    expect(
      within(cards[0]!).getByText(`${formatNumber(cardsItem.available)} disponíveis`),
    ).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Cartas Berço')).toBeInTheDocument()
    expect(within(cards[3]!).getByText(formatNumber(inv.totalLost))).toBeInTheDocument()
    expect(within(cards[3]!).getByText('Total de itens extraviados')).toBeInTheDocument()
  })

  it('reports which KPI was selected', async () => {
    const onSelect = vi.fn()
    renderWithProviders(<InventoryKpis onSelect={onSelect} />, { url })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Envelopes/ }))
    expect(onSelect).toHaveBeenCalledWith('envelopes')
    await userEvent.click(screen.getByRole('button', { name: /^Perdas Totais/ }))
    expect(onSelect).toHaveBeenCalledWith('losses')
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<InventoryKpis onSelect={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
