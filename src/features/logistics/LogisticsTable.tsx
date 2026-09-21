import { useMemo } from 'react'
import type { GroupStat } from '@/data/types/logistics'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics } from './api'

const CARD = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

function GroupTable({ groups }: { groups: GroupStat[] }) {
  const columns = useMemo<DataColumn<GroupStat>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (g) => g.label, sortValue: (g) => g.label },
      { id: 'count', header: 'Quantidade', cell: (g) => formatNumber(g.count), sortValue: (g) => g.count, align: 'right' },
      { id: 'percent', header: 'Percentual', cell: (g) => formatPercentage(g.percent, 1), sortValue: (g) => g.percent, align: 'right' },
    ],
    [],
  )
  return <DataTable caption="Objetos por status" columns={columns} data={groups} />
}

export function LogisticsTable() {
  const query = useLogistics()
  return (
    <section className={CARD}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-64" />}>
        {({ groups }) => <GroupTable groups={groups} />}
      </QueryBoundary>
    </section>
  )
}
