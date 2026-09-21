import { Suspense, lazy, useCallback, useState } from 'react'
import { AgreementFilters } from '@/app/filters/AgreementFilters'
import type { WorkflowKpi } from '@/data/types/card-processing'
import { Modal } from '@/shared/ui/Modal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { IntegrationTrend } from './IntegrationTrend'
import { OverviewCards } from './OverviewCards'
import { DetailsContent } from './details/DetailsContent'
import { KPI_META, VIEW_LABEL, type WorkflowView } from './kpis'

const WorkflowContent = lazy(() =>
  import('./workflow/WorkflowContent').then((m) => ({ default: m.WorkflowContent })),
)

type Dialog =
  | { type: 'details'; kpi: WorkflowKpi }
  | { type: 'workflow'; kpi: WorkflowKpi; view: WorkflowView }

function dialogTitle(dialog: Dialog | null): string {
  if (dialog === null) return ''
  if (dialog.type === 'details') return KPI_META[dialog.kpi].detailsTitle
  return `${VIEW_LABEL[dialog.view]} - ${KPI_META[dialog.kpi].area}`
}

export function CardProcessingPage() {
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const close = useCallback(() => setDialog(null), [])

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Processamento de Cartões</h1>
      <AgreementFilters />
      <OverviewCards
        onDetails={(kpi) => setDialog({ type: 'details', kpi })}
        onWorkflow={(kpi, view) => setDialog({ type: 'workflow', kpi, view })}
      />
      <IntegrationTrend />
      <Modal open={dialog !== null} title={dialogTitle(dialog)} onClose={close} wide>
        {dialog?.type === 'details' && <DetailsContent kpi={dialog.kpi} />}
        {dialog?.type === 'workflow' && (
          <Suspense fallback={<Skeleton className="h-80" />}>
            <WorkflowContent kpi={dialog.kpi} view={dialog.view} />
          </Suspense>
        )}
      </Modal>
    </section>
  )
}
