import { CheckCircle2, Clock, PhoneCall, PhoneMissed } from 'lucide-react'
import { formatDuration, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useContactCenter } from './api'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
const pct = (part: number, whole: number) => (whole === 0 ? 0 : (part / whole) * 100)

export function ContactCenterKpis() {
  const query = useContactCenter()
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
      {(o) => (
        <div className={GRID}>
          <KPICard
            label="Ligações"
            value={formatNumber(o.total)}
            hint={`${formatNumber(o.attended)} atendidas`}
            icon={PhoneCall}
            accent="primary"
          />
          <KPICard
            label="Endereços confirmados"
            value={formatPercentage(pct(o.confirmed, o.total), 1)}
            hint={`${formatNumber(o.confirmed)} de ${formatNumber(o.total)} ligações`}
            icon={CheckCircle2}
            accent="secondary"
          />
          <KPICard
            label="Abandono"
            value={formatPercentage(pct(o.abandoned, o.total), 1)}
            hint={`${formatNumber(o.abandoned)} sem atendimento`}
            icon={PhoneMissed}
            accent="critical"
          />
          <KPICard
            label="Tempo médio de atendimento"
            value={formatDuration(o.avgHandleSeconds)}
            hint={`${formatNumber(o.lostSeconds / 3600)} h em ligações não efetivas`}
            icon={Clock}
            accent="neutral"
          />
        </div>
      )}
    </QueryBoundary>
  )
}
