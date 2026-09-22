import {
  BookOpen,
  CreditCard,
  FileText,
  Network,
  RefreshCw,
  UserPlus,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { CardProcessingOverview, WorkflowKpi } from '@/data/types/card-processing'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard, type KPIAccent } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useOverview } from './api'
import { KPI_META, VIEW_LABEL, type WorkflowView } from './kpis'

interface OverviewCardsProps {
  onDetails: (kpi: WorkflowKpi) => void
  onWorkflow: (kpi: WorkflowKpi, view: WorkflowView) => void
}

interface KpiView {
  kpi: WorkflowKpi
  hint: string
  icon: LucideIcon
  accent: KPIAccent
  value: (o: CardProcessingOverview) => string
  summary: (o: CardProcessingOverview) => ReactNode
}

const KPIS: KpiView[] = [
  {
    kpi: 'integration',
    hint: 'Das contas para digitar',
    icon: RefreshCw,
    accent: 'purple',
    value: (o) => formatPercentage(o.integration.ratePercent),
    summary: (o) => (
      <>
        <SummaryStat
          label="Propostas digitadas"
          value={formatNumber(o.integration.digitized)}
          tone="blue"
        />
        <SummaryStat
          label="Propostas não digitadas"
          value={formatNumber(o.integration.notDigitized)}
          tone="red"
        />
      </>
    ),
  },
  {
    kpi: 'accounts',
    hint: 'Das contas digitadas',
    icon: UserPlus,
    accent: 'teal',
    value: (o) => formatPercentage(o.accounts.ratePercent),
    summary: (o) => (
      <>
        <SummaryStat label="Contas criadas" value={formatNumber(o.accounts.created)} tone="green" />
        <SummaryStat
          label="Contas não criadas"
          value={formatNumber(o.accounts.notCreated)}
          tone="red"
        />
      </>
    ),
  },
  {
    kpi: 'cards',
    hint: 'Cartões que saíram para entrega',
    icon: CreditCard,
    accent: 'orange',
    value: (o) => formatNumber(o.cards.sent),
    summary: (o) => (
      <>
        <SummaryStat
          label="Total de cartões"
          value={formatNumber(o.cards.totalAccounts)}
          tone="blue"
        />
        <SummaryStat label="Cartões enviados" value={formatNumber(o.cards.sent)} tone="green" />
      </>
    ),
  },
  {
    kpi: 'insurance',
    hint: 'Das contas digitadas',
    icon: FileText,
    accent: 'pink',
    value: (o) => formatNumber(o.insurance.withInsurance),
    summary: (o) => (
      <>
        <SummaryStat
          label="Total de propostas"
          value={formatNumber(o.insurance.total)}
          tone="blue"
        />
        <SummaryStat
          label="Propostas com seguro"
          value={formatNumber(o.insurance.withInsurance)}
          tone="green"
        />
      </>
    ),
  },
]

const VIEWS: { view: WorkflowView; icon: LucideIcon }[] = [
  { view: 'flowchart', icon: Workflow },
  { view: 'orgchart', icon: Network },
  { view: 'docs', icon: BookOpen },
]

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

export function OverviewCards({ onDetails, onWorkflow }: OverviewCardsProps) {
  const query = useOverview()
  return (
    <QueryBoundary
      query={query}
      skeleton={
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      }
    >
      {(overview) => (
        <div className={GRID}>
          {KPIS.map((k) => (
            <KPICard
              key={k.kpi}
              label={KPI_META[k.kpi].title}
              value={k.value(overview)}
              hint={k.hint}
              icon={k.icon}
              accent={k.accent}
              onSelect={() => onDetails(k.kpi)}
              actions={VIEWS.map(({ view, icon: Icon }) => (
                <button
                  key={view}
                  type="button"
                  aria-label={`${VIEW_LABEL[view]}: ${KPI_META[k.kpi].title}`}
                  onClick={() => onWorkflow(k.kpi, view)}
                  className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <Icon size={14} aria-hidden />
                  {VIEW_LABEL[view]}
                </button>
              ))}
            >
              <div className="grid grid-cols-2 gap-2">{k.summary(overview)}</div>
            </KPICard>
          ))}
        </div>
      )}
    </QueryBoundary>
  )
}
