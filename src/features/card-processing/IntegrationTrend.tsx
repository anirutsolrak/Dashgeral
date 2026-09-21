import { LineChartCard } from '@/shared/charts/LineChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useIntegrationTrend } from './api'

export function IntegrationTrend() {
  const query = useIntegrationTrend()
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-72" />}>
      {(points) => (
        <LineChartCard
          title="Taxa de Integração ao longo do tempo"
          suffix="%"
          data={points.map((p) => ({ label: p.label, value: p.value }))}
        />
      )}
    </QueryBoundary>
  )
}
