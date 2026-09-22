import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics, useLogisticsTrend, useTypeComparison } from './api'

export function LogisticsCharts() {
  const trend = useLogisticsTrend()
  const overview = useLogistics()
  const byType = useTypeComparison()
  return (
    <div className="space-y-4">
      <QueryBoundary query={trend} skeleton={<Skeleton className="h-72" />}>
        {(points) => (
          <LineChartCard
            title="Evolução de pendências logísticas"
            color={ACCENT_HEX.blue}
            data={points.map((p) => ({ label: p.label, value: p.value }))}
          />
        )}
      </QueryBoundary>
      <div className="grid gap-4 xl:grid-cols-2">
        <QueryBoundary query={overview} skeleton={<Skeleton className="h-80" />}>
          {({ groups }) => (
            <PieChartCard
              title="Distribuição por status"
              data={groups.map((g) => ({ label: g.label, value: g.count }))}
            />
          )}
        </QueryBoundary>
        <QueryBoundary query={byType} skeleton={<Skeleton className="h-80" />}>
          {(rows) => (
            <GroupedBarChartCard
              title="Flash vs. Terceiros por status"
              series={[
                { key: 'flash', label: 'Flash', color: ACCENT_HEX.blue },
                { key: 'terceiros', label: 'Terceiros', color: ACCENT_HEX.green },
              ]}
              data={rows.map((r) => ({ label: r.label, flash: r.flash, terceiros: r.terceiros }))}
            />
          )}
        </QueryBoundary>
      </div>
    </div>
  )
}
