import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildTablesData } from '@/data/mock/gallery/tables'
import { formatCurrency } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { TablesPage } from './TablesPage'

const url = '/gallery/tables?delay=0'
const { shipments } = buildTablesData()

describe('TablesPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the four examples with their tables', async () => {
    renderWithProviders(<TablesPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Tabelas (TanStack Table)' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Ordenação', 'Busca e paginação', 'Seleção de linhas', 'Células ricas e linhas expansíveis'])
    const captions = screen.getAllByRole('table').map((t) => within(t).getByText(/./, { selector: 'caption' }).textContent)
    expect(captions).toEqual(['Envios recentes', 'Todos os envios', 'Envios para seleção', 'Envios com detalhe'])
  })

  it('searches and paginates the full list', async () => {
    renderWithProviders(<TablesPage />, { url })
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Buscar' }), 'ENV-0007')
    expect(screen.getByText('1 registro')).toBeInTheDocument()
  })

  it('sums the amount of the selected rows', async () => {
    renderWithProviders(<TablesPage />, { url })
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Selecionar linha 1' }))
    expect(screen.getByText(/Valor selecionado:/)).toHaveTextContent(formatCurrency(shipments[0]!.amount).replace(/\s/g, ' '))
  })

  it('expands a row to show its events', async () => {
    renderWithProviders(<TablesPage />, { url })
    const [first] = await screen.findAllByRole('button', { name: 'Expandir detalhes' })
    await userEvent.click(first!)
    expect(screen.getByText('Objeto postado')).toBeInTheDocument()
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/tables?delay=0&error=1')
    renderWithProviders(<TablesPage />, { url: '/gallery/tables?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
