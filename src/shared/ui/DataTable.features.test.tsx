import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataColumn } from './DataTable'

interface Row {
  name: string
  qty: number
}
const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
  name: `Item ${String(i + 1).padStart(2, '0')}`,
  qty: i + 1,
}))
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Nome', cell: (r) => r.name, sortValue: (r) => r.name },
  { id: 'qty', header: 'Qtd', cell: (r) => String(r.qty), sortValue: (r) => r.qty, align: 'right' },
]
const small = rows.slice(0, 3)

describe('DataTable pagination', () => {
  it('shows only the page size and moves between pages', async () => {
    render(<DataTable caption="Itens" columns={columns} data={rows} pageSize={10} />)
    expect(screen.getAllByRole('row')).toHaveLength(11)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByText('25 registros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    expect(screen.queryByText('Item 01')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getAllByRole('row')).toHaveLength(6)
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })

  it('has no pagination nor search unless asked', () => {
    render(<DataTable caption="Itens" columns={columns} data={small} />)
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })
})

describe('DataTable search', () => {
  it('filters rows by text in sortable columns and goes back to the first page', async () => {
    render(<DataTable caption="Itens" columns={columns} data={rows} pageSize={10} searchable />)
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'Item 2')
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument()
    expect(screen.getByText('6 registros')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(7)
  })

  it('matches numeric values and shows the empty state when nothing matches', async () => {
    render(<DataTable caption="Itens" columns={columns} data={rows} searchable />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), '25')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    await userEvent.clear(screen.getByRole('searchbox', { name: 'Buscar' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'zzz')
    expect(screen.getByText('Sem dados')).toBeInTheDocument()
  })
})

describe('DataTable selection', () => {
  it('selects rows, counts them and reports the selected data', async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        caption="Itens"
        columns={columns}
        data={small}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('0 selecionadas')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 2' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 selecionada')
    expect(onSelectionChange).toHaveBeenLastCalledWith([small[1]])
    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas' }))
    expect(screen.getByRole('status')).toHaveTextContent('3 selecionadas')
    expect(onSelectionChange).toHaveBeenLastCalledWith(small)
  })

  it('keeps the selection tied to the row when the table is sorted', async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        caption="Itens"
        columns={columns}
        data={small}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 1' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([small[0]])
    const row = screen.getByRole('checkbox', { name: 'Selecionar linha 1' }).closest('tr')!
    expect(within(row).getByText('Item 01')).toBeInTheDocument()
  })
})

describe('DataTable expandable rows', () => {
  it('toggles a detail row with aria-expanded', async () => {
    render(
      <DataTable
        caption="Itens"
        columns={columns}
        data={small}
        renderDetail={(r) => <p>Detalhe de {r.name}</p>}
      />,
    )
    const [first] = screen.getAllByRole('button', { name: 'Expandir detalhes' })
    expect(first).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(first!)
    expect(screen.getByText('Detalhe de Item 01')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recolher detalhes' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Recolher detalhes' }))
    expect(screen.queryByText('Detalhe de Item 01')).not.toBeInTheDocument()
  })
})
