import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AgreementFilters } from './AgreementFilters'

const renderAt = (url: string) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[url]}>
        <AgreementFilters />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('AgreementFilters', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('lists all agreements when no category is selected', async () => {
    renderAt('/')
    expect(await screen.findByRole('option', { name: 'INSS Aposentados' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Governo Federal' })).toBeInTheDocument()
  })

  it('narrows agreements to the selected category and keeps the choice in the URL state', async () => {
    renderAt('/')
    await screen.findByRole('option', { name: 'INSS Aposentados' })
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'inss')
    expect(screen.queryByRole('option', { name: 'Governo Federal' })).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Convênio'), 'inss-pensionistas')
    expect(screen.getByLabelText('Convênio')).toHaveValue('inss-pensionistas')
  })

  it('resets the agreement when the category changes', async () => {
    renderAt('/?agreementCategory=inss&agreement=inss-pensionistas')
    await screen.findByRole('option', { name: 'INSS Pensionistas' })
    expect(screen.getByLabelText('Convênio')).toHaveValue('inss-pensionistas')
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'governo')
    expect(screen.getByLabelText('Convênio')).toHaveValue('all')
  })

  it('shows a fallback message when the catalog fails to load', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderAt('/?delay=0&error=1')
    expect(await screen.findByText('Filtros de convênio indisponíveis')).toBeInTheDocument()
  })
})
