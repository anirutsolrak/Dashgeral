import { useMemo } from 'react'
import type { GroupStat, StepCount } from '@/data/types/logistics'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useLogistics } from './api'
import type { LogisticsKpi } from './kpis'

function GroupDetails({ group }: { group: GroupStat }) {
  const columns = useMemo<DataColumn<StepCount>[]>(
    () => [
      { id: 'step', header: 'Etapa', cell: (s) => s.label, sortValue: (s) => s.label },
      {
        id: 'count',
        header: 'Quantidade',
        cell: (s) => formatNumber(s.count),
        sortValue: (s) => s.count,
        align: 'right',
      },
      {
        id: 'share',
        header: 'Percentual do grupo',
        cell: (s) => formatPercentage(group.count === 0 ? 0 : (s.count / group.count) * 100, 1),
        sortValue: (s) => s.count,
        align: 'right',
      },
    ],
    [group.count],
  )
  const withRecords = group.steps.filter((s) => s.count > 0).length
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryStat label="Total de objetos" value={formatNumber(group.count)} />
        <SummaryStat label="Participação" value={formatPercentage(group.percent, 1)} tone="green" />
        <SummaryStat
          label="Etapas com registros"
          value={`${withRecords} de ${group.steps.length}`}
        />
      </div>
      <PieChartCard
        title={`Distribuição de ${group.label}`}
        data={group.steps.map((s) => ({ label: s.label, value: s.count }))}
      />
      <DataTable caption={`Etapas de ${group.label}`} columns={columns} data={group.steps} />
    </div>
  )
}

export function LogisticsDetails({ kpi }: { kpi: LogisticsKpi }) {
  const query = useLogistics()
  return (
    <QueryBoundary query={query}>
      {({ groups }) => {
        const group = groups.find((g) => g.key === kpi)
        return group ? <GroupDetails group={group} /> : null
      }}
    </QueryBoundary>
  )
}
