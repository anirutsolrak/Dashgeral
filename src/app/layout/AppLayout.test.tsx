import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/app/routes'
import { AppLayout } from './AppLayout'
import { useAppTheme } from './ThemeContext'

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

  it('shares the theme state with descendants through the context', async () => {
    function Probe() {
      return <span data-testid="probe">{useAppTheme().theme}</span>
    }
    const probeRoutes: RouteObject[] = [
      { path: '/', element: <AppLayout />, children: [{ index: true, element: <Probe /> }] },
    ]
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={createMemoryRouter(probeRoutes, { initialEntries: ['/'] })} />
      </QueryClientProvider>,
    )
    expect(await screen.findByTestId('probe')).toHaveTextContent('light')
    await userEvent.click(screen.getByRole('button', { name: /tema/i }))
    expect(screen.getByTestId('probe')).toHaveTextContent('dark')
  })

  it('lets the user change the period filter', async () => {
    renderAt('/financial')
    await userEvent.selectOptions(await screen.findByLabelText('Período'), '30d')
    expect(screen.getByLabelText('Período')).toHaveValue('30d')
  })

  it('keeps the query string when redirecting from the index route', async () => {
    renderAt('/?period=30d')
    expect(await screen.findByRole('heading', { level: 1, name: 'Processamento de Cartões' })).toBeInTheDocument()
    expect(screen.getByLabelText('Período')).toHaveValue('30d')
  })
})
