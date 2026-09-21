import { useMemo } from 'react'
import type { StockItem } from '@/data/types/inventory'
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { BarChartCard } from '@/shared/charts/BarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useInventory } from './api'
import type { InventoryKpi } from './kpis'

interface StatusRow {
  status: string
  quantity: number
}

function ItemDetails({ item }: { item: StockItem }) {
  const rows = useMemo<StatusRow[]>(
    () => [
      { status: 'Disponíveis', quantity: item.available },
      { status: 'Em trânsito', quantity: item.inTransit },
      { status: 'Perdidos', quantity: item.lost },
    ],
    [item],
  )
  const columns = useMemo<DataColumn<StatusRow>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (r) => r.status, sortValue: (r) => r.status },
      { id: 'quantity', header: 'Quantidade', cell: (r) => formatNumber(r.quantity), sortValue: (r) => r.quantity, align: 'right' },
      {
        id: 'share',
        header: 'Percentual',
        cell: (r) => formatPercentage(item.total === 0 ? 0 : (r.quantity / item.total) * 100, 1),
        sortValue: (r) => r.quantity,
        align: 'right',
      },
    ],
    [item.total],
  )
  return (
    <div className="space-y-4">
      <PieChartCard title={`Distribuição de ${item.label}`} data={rows.map((r) => ({ label: r.status, value: r.quantity }))} />
      <DataTable caption={`Status de ${item.label}`} columns={columns} data={rows} />
    </div>
  )
}

export function InventoryDetails({ kpi }: { kpi: InventoryKpi }) {
  const query = useInventory()
  return (
    <QueryBoundary query={query}>
      {({ items, totalLost }) => {
        if (kpi === 'losses') {
          return (
            <div className="space-y-4">
              <BarChartCard
                title="Perdas por item"
                data={items.map((i) => ({ label: i.label, value: i.lost, color: ACCENT_HEX.red }))}
              />
              <SummaryStat label="Total de perdas" value={formatNumber(totalLost)} tone="red" />
            </div>
          )
        }
        const item = items.find((i) => i.key === kpi)
        return item ? <ItemDetails item={item} /> : null
      }}
    </QueryBoundary>
  )
}
