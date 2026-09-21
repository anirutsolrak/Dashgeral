import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CardProcessingPage } from './CardProcessingPage'

const url = '/?delay=0'

describe('CardProcessingPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, agreement filters, four KPIs and the trend', async () => {
    renderWithProviders(<CardProcessingPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Processamento de Cartões' })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByRole('heading', { name: 'Taxa de Integração ao longo do tempo' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Categoria')).toBeInTheDocument()
  })

  it('opens the KPI details in a dialog and closes it with Escape', async () => {
    renderWithProviders(<CardProcessingPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Cartões Enviados/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Cartões Enviados - Detalhamento' })
    expect(await within(dialog).findByRole('heading', { name: 'Status dos cartões' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens a workflow view, loading it lazily', async () => {
    renderWithProviders(<CardProcessingPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: 'Fluxograma: Taxa de Integração' }))
    const dialog = await screen.findByRole('dialog', { name: 'Fluxograma - Operações' })
    expect(await within(dialog).findByText('Proposta recebida')).toBeInTheDocument()
  })

  it('shows error alerts when the repositories fail', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<CardProcessingPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })

  it('reacts to ?error=1 added while the page is open (dev flags are part of the query key)', async () => {
    const router = createMemoryRouter([{ path: '/', element: <CardProcessingPage /> }], {
      initialEntries: [url],
    })
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await act(() => router.navigate('/?delay=0&error=1'))
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
