import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { RechartsPage } from './RechartsPage'

const url = '/gallery/recharts?delay=0'

describe('RechartsPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the six examples with their charts', async () => {
    renderWithProviders(<RechartsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Recharts' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Linha', 'Barras agrupadas', 'Pizza', 'Área empilhada', 'Composto (barras e linha)', 'Radar'])
    expect(await screen.findByRole('heading', { name: 'Volume por canal em 12 meses' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /Jan: Agência .*Digital .*Telefone/ }).length).toBeGreaterThan(0)
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/recharts?delay=0&error=1')
    renderWithProviders(<RechartsPage />, { url: '/gallery/recharts?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
