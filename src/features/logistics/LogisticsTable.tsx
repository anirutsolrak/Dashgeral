import { useMemo } from 'react'
import type { GroupStat } from '@/data/types/logistics'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics } from './api'

function GroupTable({ groups }: { groups: GroupStat[] }) {
  const columns = useMemo<DataColumn<GroupStat>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (g) => g.label, sortValue: (g) => g.label },
      {
        id: 'count',
        header: 'Quantidade',
        cell: (g) => formatNumber(g.count),
        sortValue: (g) => g.count,
        align: 'right',
      },
      {
        id: 'percent',
        header: 'Percentual',
        cell: (g) => formatPercentage(g.percent, 1),
        sortValue: (g) => g.percent,
        align: 'right',
      },
    ],
    [],
  )
  return <DataTable caption="Objetos por status" columns={columns} data={groups} />
}

export function LogisticsTable() {
  const query = useLogistics()
  return (
    <section className={CHART_CARD_CLASS}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-64" />}>
        {({ groups }) => <GroupTable groups={groups} />}
      </QueryBoundary>
    </section>
  )
}
