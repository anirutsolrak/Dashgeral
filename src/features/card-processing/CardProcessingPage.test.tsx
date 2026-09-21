import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { CardProcessingPage } from './CardProcessingPage'

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <CardProcessingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('CardProcessingPage', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('shows the KPI cards once data loads', async () => {
    renderPage()
    expect(await screen.findByText('Total de propostas')).toBeInTheDocument()
    expect(screen.getByText('Taxa de integração')).toBeInTheDocument()
    expect(screen.getByText('Contas criadas')).toBeInTheDocument()
    expect(screen.getByText('Cartões enviados')).toBeInTheDocument()
  })

  it('shows an error state when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
