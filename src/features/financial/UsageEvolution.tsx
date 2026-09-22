import { LineChartCard } from '@/shared/charts/LineChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useUsageEvolution } from './api'

export function UsageEvolution() {
  const query = useUsageEvolution()
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-72" />}>
      {(points) => (
        <LineChartCard
          title="Evolução da Utilização Média (em R$ mil)"
          data={points.map((p) => ({ label: p.label, value: p.value }))}
        />
      )}
    </QueryBoundary>
  )
}
