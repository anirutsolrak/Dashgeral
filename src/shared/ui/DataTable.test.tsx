import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable, type DataColumn } from './DataTable'

interface Row {
  name: string
  qty: number
}
const data: Row[] = [
  { name: 'Beta', qty: 5 },
  { name: 'Alfa', qty: 20 },
  { name: 'Gama', qty: 1 },
]
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Nome', cell: (r) => r.name, sortValue: (r) => r.name },
  { id: 'qty', header: 'Quantidade', cell: (r) => `${r.qty} un.`, sortValue: (r) => r.qty, align: 'right' },
  { id: 'note', header: 'Obs.', cell: () => '-' },
]

const bodyNames = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent)

describe('DataTable', () => {
  it('renders caption, headers and custom cells', () => {
    render(<DataTable caption="Itens" columns={columns} data={data} />)
    expect(screen.getByRole('table', { name: 'Itens' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(screen.getByText('20 un.')).toBeInTheDocument()
    expect(bodyNames()).toEqual(['Beta', 'Alfa', 'Gama'])
  })

  it('sorts ascending, descending and back to the original order', async () => {
    render(<DataTable caption="Itens" columns={columns} data={data} />)
    const header = screen.getByRole('columnheader', { name: /Quantidade/ })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Gama', 'Beta', 'Alfa'])
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Alfa', 'Beta', 'Gama'])
    expect(header).toHaveAttribute('aria-sort', 'descending')
    await userEvent.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Beta', 'Alfa', 'Gama'])
    expect(header).toHaveAttribute('aria-sort', 'none')
  })

  it('does not offer sorting on columns without a sortValue', () => {
    render(<DataTable caption="Itens" columns={columns} data={data} />)
    const header = screen.getByRole('columnheader', { name: 'Obs.' })
    expect(within(header).queryByRole('button')).not.toBeInTheDocument()
    expect(header).not.toHaveAttribute('aria-sort')
  })

  it('shows an empty state', () => {
    render(<DataTable caption="Itens" columns={columns} data={[]} />)
    expect(screen.getByText('Sem dados')).toBeInTheDocument()
  })
})
