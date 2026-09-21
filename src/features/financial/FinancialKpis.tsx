import { Banknote, Calculator, Percent, Truck } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useFinancialOverview } from './api'
import { FIN_KPI_META, type FinancialKpi } from './kpis'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

export function FinancialKpis({ onSelect }: { onSelect: (kpi: FinancialKpi) => void }) {
  const query = useFinancialOverview()
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
      {({ limitUsage, usageByRange, logistics }) => {
        const topRange = usageByRange.at(-1)
        return (
          <div className={GRID}>
            <KPICard
              label={FIN_KPI_META.usage.title}
              value={formatPercentage(limitUsage.ratePercent)}
              hint={formatCurrency(limitUsage.usedAmount)}
              icon={Percent}
              accent="teal"
              onSelect={() => onSelect('usage')}
            />
            <KPICard
              label={FIN_KPI_META.total.title}
              value={formatCurrency(limitUsage.usedAmount)}
              hint={`${formatNumber(topRange?.customers ?? 0)} clientes acima de 75%`}
              icon={Banknote}
              accent="purple"
              onSelect={() => onSelect('total')}
            />
            <KPICard
              label={FIN_KPI_META.average.title}
              value={formatCurrency(limitUsage.averageUsage)}
              hint="Por cliente"
              icon={Calculator}
              accent="orange"
              onSelect={() => onSelect('average')}
            />
            <KPICard
              label={FIN_KPI_META.logistics.title}
              value={formatCurrency(logistics.totalAmount)}
              hint={`${formatCurrency(logistics.unitTotal)} por cartão`}
              icon={Truck}
              accent="pink"
              onSelect={() => onSelect('logistics')}
            />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
