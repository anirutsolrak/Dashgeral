import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom'
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

  it('refetches when dev flags change while on the page', async () => {
    const router = createMemoryRouter([{ path: '/', element: <CardProcessingPage /> }], {
      initialEntries: ['/?delay=0'],
    })
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    expect(await screen.findByText('Total de propostas')).toBeInTheDocument()
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await act(() => router.navigate('/?delay=0&error=1'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
