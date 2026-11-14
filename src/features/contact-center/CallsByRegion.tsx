import { useMemo } from 'react'
import type { OperatorStat } from '@/data/types/contact-center'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { formatDuration, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { RegionMap } from '@/shared/maps/RegionMap'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useCallsByRegion, useOperators } from './api'

const rate = (part: number, whole: number) => (whole === 0 ? 0 : (part / whole) * 100)
// A escala padrão do mapa é para taxas de desbloqueio (75-85%); confirmação por telefone roda bem abaixo.
const confirmationColor = (v: number) => (v >= 52 ? '#1baf7a' : v >= 45 ? '#eda100' : '#d03b3b')

function OperatorsTable({ operators }: { operators: OperatorStat[] }) {
  const columns = useMemo<DataColumn<OperatorStat>[]>(
    () => [
      { id: 'name', header: 'Operador', cell: (o) => o.name, sortValue: (o) => o.name },
      {
        id: 'calls',
        header: 'Ligações',
        cell: (o) => formatNumber(o.calls),
        sortValue: (o) => o.calls,
        align: 'right',
      },
      {
        id: 'rate',
        header: 'Confirmação',
        cell: (o) => formatPercentage(rate(o.confirmed, o.calls), 1),
        sortValue: (o) => rate(o.confirmed, o.calls),
        align: 'right',
      },
      {
        id: 'tma',
        header: 'TMA',
        cell: (o) => formatDuration(o.avgHandleSeconds),
        sortValue: (o) => o.avgHandleSeconds,
        align: 'right',
      },
    ],
    [],
  )
  return <DataTable caption="Desempenho por operador" columns={columns} data={operators} />
}

export function CallsByRegion() {
  const regions = useCallsByRegion()
  const operators = useOperators()
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <QueryBoundary query={regions} skeleton={<Skeleton className="h-80" />}>
        {(data) => (
          <RegionMap
            title="Taxa de confirmação por região"
            format={(v) => formatPercentage(v, 1)}
            colorFor={confirmationColor}
            points={data
              .filter((r) => r.calls > 0)
              .map((r) => ({
                id: r.region,
                label: r.label,
                lat: r.lat,
                lng: r.lng,
                value: rate(r.confirmed, r.calls),
                detail: `${formatNumber(r.confirmed)} confirmados em ${formatNumber(r.calls)} ligações`,
              }))}
          />
        )}
      </QueryBoundary>
      <section className={CHART_CARD_CLASS}>
        <QueryBoundary query={operators} skeleton={<Skeleton className="h-64" />}>
          {(data) => <OperatorsTable operators={data} />}
        </QueryBoundary>
      </section>
    </div>
  )
}
