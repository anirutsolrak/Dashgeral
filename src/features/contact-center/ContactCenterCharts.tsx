import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useHourly, useTabulations } from './api'

export function ContactCenterCharts() {
  const tabulations = useTabulations()
  const hourly = useHourly()
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <QueryBoundary query={tabulations} skeleton={<Skeleton className="h-80" />}>
        {(data) => (
          <PieChartCard
            title="Resultado das ligações"
            data={data}
            footnote="Só ligações atendidas. Abandonadas não recebem tabulação."
          />
        )}
      </QueryBoundary>
      <QueryBoundary query={hourly} skeleton={<Skeleton className="h-80" />}>
        {(data) => (
          <GroupedBarChartCard
            title="Ligações por hora"
            series={[
              { key: 'attended', label: 'Atendidas', color: ACCENT_HEX.green },
              { key: 'abandoned', label: 'Abandonadas', color: ACCENT_HEX.red },
            ]}
            data={data.map((h) => ({ ...h }))}
          />
        )}
      </QueryBoundary>
    </div>
  )
}
