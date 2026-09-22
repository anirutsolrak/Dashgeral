import { Archive, PackageCheck, Truck, Undo2, type LucideIcon } from 'lucide-react'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard, type KPIAccent } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics } from './api'
import { LOG_KPI_META, type LogisticsKpi } from './kpis'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

const ITEMS: { key: LogisticsKpi; icon: LucideIcon; accent: KPIAccent }[] = [
  { key: 'entregue', icon: PackageCheck, accent: 'teal' },
  { key: 'pendente', icon: Truck, accent: 'blue' },
  { key: 'custodia', icon: Archive, accent: 'orange' },
  { key: 'devolvido', icon: Undo2, accent: 'purple' },
]

export function LogisticsKpis({ onSelect }: { onSelect: (kpi: LogisticsKpi) => void }) {
  const query = useLogistics()
  return (
    <QueryBoundary
      query={query}
      skeleton={
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      }
    >
      {({ groups }) => (
        <div className={GRID}>
          {ITEMS.map(({ key, icon, accent }) => {
            const group = groups.find((g) => g.key === key)
            return (
              <KPICard
                key={key}
                label={LOG_KPI_META[key].title}
                value={formatPercentage(group?.percent ?? 0, 1)}
                hint={`${formatNumber(group?.count ?? 0)} objetos`}
                icon={icon}
                accent={accent}
                onSelect={() => onSelect(key)}
              />
            )
          })}
        </div>
      )}
    </QueryBoundary>
  )
}
