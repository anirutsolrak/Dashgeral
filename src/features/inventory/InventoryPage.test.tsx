import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { InventoryPage } from './InventoryPage'

const url = '/?delay=0'

describe('InventoryPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, the four KPIs and both charts', async () => {
    renderWithProviders(<InventoryPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Gestão de Estoque' })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByRole('heading', { name: 'Estoque por item' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Perdas no período' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Cartões: Disponíveis .*Em trânsito .*Perdidos/ })).toBeInTheDocument()
  })

  it('opens the details of an item in a dialog and closes it with Escape', async () => {
    renderWithProviders(<InventoryPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Cartões/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Cartões - Detalhamento' })
    expect(await within(dialog).findByRole('table', { name: 'Status de Cartões' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows error alerts when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<InventoryPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
