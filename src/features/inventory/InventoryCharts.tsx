import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useInventory, useLossTrend } from './api'

export function InventoryCharts() {
  const inventory = useInventory()
  const losses = useLossTrend()
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <QueryBoundary query={inventory} skeleton={<Skeleton className="h-80" />}>
        {({ items }) => (
          <GroupedBarChartCard
            title="Estoque por item"
            series={[
              { key: 'available', label: 'Disponíveis', color: ACCENT_HEX.green },
              { key: 'inTransit', label: 'Em trânsito', color: ACCENT_HEX.blue },
              { key: 'lost', label: 'Perdidos', color: ACCENT_HEX.red },
            ]}
            data={items.map((i) => ({
              label: i.label,
              available: i.available,
              inTransit: i.inTransit,
              lost: i.lost,
            }))}
          />
        )}
      </QueryBoundary>
      <QueryBoundary query={losses} skeleton={<Skeleton className="h-80" />}>
        {(points) => (
          <LineChartCard
            title="Perdas no período"
            color={ACCENT_HEX.red}
            data={points.map((p) => ({ label: p.label, value: p.value }))}
          />
        )}
      </QueryBoundary>
    </div>
  )
}
