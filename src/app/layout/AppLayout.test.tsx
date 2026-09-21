import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/app/routes'

const renderAt = (url: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [url] })} />
    </QueryClientProvider>,
  )

describe('AppLayout', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/?delay=0')
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('keeps active filters in navigation links', async () => {
    renderAt('/financial?period=30d')
    const link = await screen.findByRole('link', { name: /Processamento de Cartões/ })
    expect(link).toHaveAttribute('href', expect.stringContaining('period=30d'))
  })

  it('shows the placeholder for routes not built yet', async () => {
    renderAt('/financial')
    expect(
      await screen.findByRole('heading', { name: 'Desempenho Financeiro' }),
    ).toBeInTheDocument()
  })

  it('toggles the dark theme class', async () => {
    renderAt('/financial')
    await userEvent.click(await screen.findByRole('button', { name: /tema/i }))
    expect(document.documentElement).toHaveClass('dark')
  })

  it('lets the user change the period filter', async () => {
    renderAt('/financial')
    await userEvent.selectOptions(await screen.findByLabelText('Período'), '30d')
    expect(screen.getByLabelText('Período')).toHaveValue('30d')
  })

  it('keeps the query string when redirecting from the index route', async () => {
    renderAt('/?period=30d')
    expect(await screen.findByText('Total de propostas')).toBeInTheDocument()
    expect(screen.getByLabelText('Período')).toHaveValue('30d')
  })
})
