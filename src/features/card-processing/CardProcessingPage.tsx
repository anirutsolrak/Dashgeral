import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useCardProcessingKpis } from './api'

export function CardProcessingPage() {
  const query = useCardProcessingKpis()
  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Processamento de Cartões</h1>
      <QueryBoundary
        query={query}
        skeleton={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} />)}
          </div>
        }
      >
        {(k) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard label="Total de propostas" value={formatNumber(k.totalProposals)} />
            <KPICard label="Taxa de integração" value={formatPercentage(k.integrationRate)} />
            <KPICard label="Contas criadas" value={formatNumber(k.accountsCreated)} />
            <KPICard label="Cartões enviados" value={formatNumber(k.cardsSent)} />
          </div>
        )}
      </QueryBoundary>
    </section>
  )
}
