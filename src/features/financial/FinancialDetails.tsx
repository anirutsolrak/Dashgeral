import { useMemo } from 'react'
import type { CostByStatus } from '@/data/types/financial'
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { BarChartCard } from '@/shared/charts/BarChartCard'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useFinancialOverview } from './api'
import type { FinancialKpi } from './kpis'

function CostsTable({ rows, total }: { rows: CostByStatus[]; total: number }) {
  const columns = useMemo<DataColumn<CostByStatus>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (r) => r.status, sortValue: (r) => r.status },
      {
        id: 'count',
        header: 'Cartões',
        cell: (r) => formatNumber(r.count),
        sortValue: (r) => r.count,
        align: 'right',
      },
      {
        id: 'amount',
        header: 'Valor total',
        cell: (r) => formatCurrency(r.amount),
        sortValue: (r) => r.amount,
        align: 'right',
      },
      {
        id: 'cost',
        header: 'Custo por cartão',
        cell: (r) => formatCurrency(r.costPerCard),
        sortValue: (r) => r.costPerCard,
        align: 'right',
      },
      {
        id: 'available',
        header: 'Disponível por cartão',
        cell: (r) => formatCurrency(r.availablePerCard),
        sortValue: (r) => r.availablePerCard,
        align: 'right',
      },
      {
        id: 'share',
        header: 'Percentual',
        cell: (r) => formatPercentage(total === 0 ? 0 : (r.amount / total) * 100, 1),
        sortValue: (r) => r.amount,
        align: 'right',
      },
    ],
    [total],
  )
  return <DataTable caption="Custos por status" columns={columns} data={rows} />
}

export function FinancialDetails({ kpi }: { kpi: FinancialKpi }) {
  const query = useFinancialOverview()
  return (
    <QueryBoundary query={query}>
      {({ limitUsage, usageByRange, logistics }) => {
        if (kpi === 'usage') {
          return (
            <div className="space-y-4">
              <PieChartCard
                title="Distribuição do Limite de Crédito"
                data={usageByRange.map((r) => ({ label: r.range, value: r.customers }))}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat
                  label="Limite utilizado"
                  value={formatCurrency(limitUsage.usedAmount)}
                  tone="blue"
                />
                <SummaryStat
                  label="Limite disponível"
                  value={formatCurrency(limitUsage.totalAmount - limitUsage.usedAmount)}
                  tone="green"
                />
                <SummaryStat
                  label="Limite total"
                  value={formatCurrency(limitUsage.totalAmount)}
                  tone="blue"
                />
              </div>
            </div>
          )
        }
        if (kpi === 'total') {
          return (
            <BarChartCard
              title="Clientes por faixa de utilização"
              data={usageByRange.map((r) => ({ label: r.range, value: r.customers }))}
            />
          )
        }
        if (kpi === 'average') {
          return (
            <GroupedBarChartCard
              title="Uso médio por faixa"
              series={[
                { key: 'average', label: 'Uso médio', color: ACCENT_HEX.purple },
                { key: 'available', label: 'Disponível médio', color: ACCENT_HEX.green },
              ]}
              data={usageByRange.map((r) => ({
                label: r.range,
                average: r.average,
                available: r.averageAvailable,
              }))}
            />
          )
        }
        return (
          <div className="space-y-4">
            <BarChartCard
              title="Composição do custo por cartão"
              data={[
                { label: 'Cartão', value: logistics.unit.card },
                { label: 'Envelope', value: logistics.unit.envelope },
                { label: 'Carta', value: logistics.unit.letter },
                { label: 'Envio', value: logistics.unit.shipping },
              ]}
            />
            <CostsTable rows={logistics.byStatus} total={logistics.totalAmount} />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
