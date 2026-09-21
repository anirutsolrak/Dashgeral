import { useAppTheme } from '@/app/layout/ThemeContext'
import type { WorkflowKpi } from '@/data/types/card-processing'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useWorkflow } from '../api'
import { KPI_META, VIEW_LABEL, type WorkflowView } from '../kpis'
import { DocsList } from './DocsList'
import { FlowDiagram } from '@/shared/flow/FlowDiagram'
import { OrgChart } from '@/shared/flow/OrgChart'

interface WorkflowContentProps {
  kpi: WorkflowKpi
  view: WorkflowView
}

export function WorkflowContent({ kpi, view }: WorkflowContentProps) {
  const { theme } = useAppTheme()
  const query = useWorkflow(kpi)
  const label = `${VIEW_LABEL[view]} - ${KPI_META[kpi].area}`
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-80" />}>
      {(info) => {
        if (view === 'flowchart')
          return <FlowDiagram steps={info.flow} label={label} theme={theme} />
        if (view === 'orgchart') return <OrgChart root={info.org} label={label} theme={theme} />
        return <DocsList docs={info.docs} />
      }}
    </QueryBoundary>
  )
}
