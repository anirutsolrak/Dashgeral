import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { Fragment, useMemo, useState, type ReactNode } from 'react'

export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  /** Valor usado na ordenação e na busca; colunas sem ele não ordenam nem entram na busca. */
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  data: T[]
  caption: string
  searchable?: boolean
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void
  renderDetail?: (row: T) => ReactNode
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const
const BUTTON = 'rounded-md border border-slate-300 px-2 py-1 disabled:opacity-40 dark:border-slate-700'

export function DataTable<T>({
  columns,
  data,
  caption,
  searchable = false,
  pageSize,
  selectable = false,
  onSelectionChange,
  renderDetail,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filter, setFilter] = useState('')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const hasDetail = renderDetail !== undefined

  const defs = useMemo<ColumnDef<T>[]>(() => {
    const own: ColumnDef<T>[] = columns.map((c) => ({
      id: c.id,
      header: c.header,
      enableSorting: c.sortValue !== undefined,
      accessorFn: (row: T) => c.sortValue?.(row) ?? '',
      cell: ({ row }) => c.cell(row.original),
    }))
    const lead: ColumnDef<T>[] = []
    if (hasDetail) {
      lead.push({
        id: '_expand',
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Detalhes</span>,
        cell: ({ row }) => (
          <button
            type="button"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? 'Recolher detalhes' : 'Expandir detalhes'}
            onClick={row.getToggleExpandedHandler()}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {row.getIsExpanded() ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
          </button>
        ),
      })
    }
    if (selectable) {
      lead.push({
        id: '_select',
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Selecionar todas as linhas"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Selecionar linha ${row.index + 1}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      })
    }
    return [...lead, ...own]
  }, [columns, hasDetail, selectable])
  const byId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])

  // A seleção usa o índice original em `data` (id padrão da linha), estável sob ordenação e busca.
  const handleSelection: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === 'function' ? updater(selection) : updater
    setSelection(next)
    onSelectionChange?.(data.filter((_, i) => next[String(i)]))
  }

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table não é compatível com o React Compiler; sem memoização automática aqui
  const table = useReactTable({
    data,
    columns: defs,
    state: { sorting, globalFilter: filter, rowSelection: selection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    onRowSelectionChange: handleSelection,
    enableRowSelection: selectable,
    getRowCanExpand: () => hasDetail,
    globalFilterFn: 'includesString',
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pageSize !== undefined
      ? { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize } } }
      : {}),
  })

  const rows = table.getRowModel().rows
  const total = table.getFilteredRowModel().rows.length
  const selectedCount = Object.values(selection).filter(Boolean).length
  const colCount = table.getVisibleLeafColumns().length
  const alignClass = (id: string) => (byId.get(id)?.align === 'right' ? 'text-right' : 'text-left')

  return (
    <div>
      {(searchable || selectable) && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          {searchable ? (
            <input
              type="search"
              aria-label="Buscar"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          ) : (
            <span />
          )}
          {selectable && (
            <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
              {`${selectedCount} ${selectedCount === 1 ? 'selecionada' : 'selecionadas'}`}
            </p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-base font-semibold">{caption}</caption>
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const sortable = header.column.getCanSort()
                  const label = flexRender(header.column.columnDef.header, header.getContext())
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sortable ? (sorted ? ARIA_SORT[sorted] : 'none') : undefined}
                      className={`px-3 py-2 font-medium ${alignClass(header.column.id)}`}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          {label}
                          {sorted === 'asc' ? (
                            <ArrowUp size={12} aria-hidden />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={12} aria-hidden />
                          ) : (
                            <ChevronsUpDown size={12} aria-hidden />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                  Sem dados
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${
                      row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-950/40' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={`px-3 py-2 tabular-nums ${alignClass(cell.column.id)}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {renderDetail && row.getIsExpanded() && (
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td colSpan={colCount} className="bg-slate-50 px-3 py-3 dark:bg-slate-800/40">
                        {renderDetail(row.original)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageSize !== undefined && (
        <nav aria-label="Paginação" className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>{`${total} ${total === 1 ? 'registro' : 'registros'}`}</span>
          <div className="flex items-center gap-2">
            <button type="button" className={BUTTON} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </button>
            <span>{`Página ${table.getState().pagination.pageIndex + 1} de ${Math.max(table.getPageCount(), 1)}`}</span>
            <button type="button" className={BUTTON} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Próxima
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
