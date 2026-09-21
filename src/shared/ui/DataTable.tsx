import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  data: T[]
  caption: string
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const

export function DataTable<T>({ columns, data, caption }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.id,
        header: c.header,
        enableSorting: c.sortValue !== undefined,
        accessorFn: (row: T) => c.sortValue?.(row) ?? '',
        cell: ({ row }) => c.cell(row.original),
      })),
    [columns],
  )
  const byId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table não é compatível com o React Compiler; sem memoização automática aqui
  const table = useReactTable({
    data,
    columns: defs,
    state: { sorting },
    onSortingChange: setSorting,
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const alignClass = (id: string) => (byId.get(id)?.align === 'right' ? 'text-right' : 'text-left')

  return (
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
              <td colSpan={columns.length} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                Sem dados
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={`px-3 py-2 tabular-nums ${alignClass(cell.column.id)}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
