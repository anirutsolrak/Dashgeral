import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FlowPage } from './FlowPage'

const url = '/gallery/flow?delay=0'

describe('FlowPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', url)
    localStorage.clear()
  })

  it('renders the four examples as labelled figures', async () => {
    renderWithProviders(<FlowPage />, { url })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Fluxos (React Flow)' }),
    ).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual([
      'Fluxograma',
      'Organograma',
      'Pipeline com status',
      'Árvore de decisão',
    ])
    expect(screen.getAllByRole('figure')).toHaveLength(4)
  })

  it('draws the nodes of each diagram', async () => {
    renderWithProviders(<FlowPage />, { url })
    expect(await screen.findByText('Pedido recebido')).toBeInTheDocument()
    expect(screen.getByText('Diretor de Logística')).toBeInTheDocument()
    expect(screen.getByText('Coleta')).toBeInTheDocument()
    expect(screen.getByText('Endereço válido?')).toBeInTheDocument()
  })

  it('states the status of every pipeline node in text, not only by colour', async () => {
    renderWithProviders(<FlowPage />, { url })
    await screen.findByText('Coleta')
    expect(screen.getAllByText(/^(Normal|Atenção|Crítico)$/)).toHaveLength(5)
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/flow?delay=0&error=1')
    renderWithProviders(<FlowPage />, { url: '/gallery/flow?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
