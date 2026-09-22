import type { WorkflowKpi } from '@/data/types/card-processing'
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { BarChartCard } from '@/shared/charts/BarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatNumber } from '@/shared/lib/formatters'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import {
  useAccountReasons,
  useInsuranceBreakdown,
  useIntegrationReasons,
  useOverview,
} from '../api'
import { toChartData } from './toChartData'

const GRID = 'grid gap-4 md:grid-cols-2'

function IntegrationDetails() {
  const overview = useOverview()
  const reasons = useIntegrationReasons()
  return (
    <QueryBoundary query={overview}>
      {(o) => (
        <div className="space-y-4">
          <BarChartCard
            title="Digitadas x Não digitadas"
            data={[
              { label: 'Digitadas', value: o.integration.digitized, color: ACCENT_HEX.green },
              { label: 'Não digitadas', value: o.integration.notDigitized, color: ACCENT_HEX.red },
            ]}
          />
          <QueryBoundary query={reasons}>
            {(r) => (
              <div className={GRID}>
                <PieChartCard
                  title="Motivos de parada das propostas digitadas"
                  data={toChartData(r.stopReasons)}
                />
                <PieChartCard
                  title="Propostas não digitadas"
                  data={toChartData(r.nonDigitizedBreakdown)}
                />
              </div>
            )}
          </QueryBoundary>
        </div>
      )}
    </QueryBoundary>
  )
}

function AccountsDetails() {
  const overview = useOverview()
  const reasons = useAccountReasons()
  return (
    <QueryBoundary query={overview}>
      {(o) => (
        <div className="space-y-4">
          <BarChartCard
            title="Contas criadas x não criadas"
            data={[
              { label: 'Criadas', value: o.accounts.created, color: ACCENT_HEX.green },
              { label: 'Não criadas', value: o.accounts.notCreated, color: ACCENT_HEX.red },
            ]}
          />
          <QueryBoundary query={reasons}>
            {(r) => (
              <div className={GRID}>
                <PieChartCard title="Motivos das contas criadas" data={toChartData(r.created)} />
                <PieChartCard
                  title="Motivos das contas não criadas"
                  data={toChartData(r.notCreated)}
                />
              </div>
            )}
          </QueryBoundary>
        </div>
      )}
    </QueryBoundary>
  )
}

function CardsDetails() {
  const overview = useOverview()
  return (
    <QueryBoundary query={overview}>
      {(o) => (
        <BarChartCard
          title="Status dos cartões"
          data={[
            { label: 'Enviados', value: o.cards.sent, color: ACCENT_HEX.green },
            { label: 'Não enviados', value: o.cards.notSent, color: ACCENT_HEX.red },
          ]}
        />
      )}
    </QueryBoundary>
  )
}

function InsuranceDetails() {
  const breakdown = useInsuranceBreakdown()
  const overview = useOverview()
  return (
    <QueryBoundary query={breakdown}>
      {(b) => (
        <div className="space-y-4">
          <div className={GRID}>
            <PieChartCard
              title="Distribuição total de propostas"
              data={toChartData(b.byCoverage)}
            />
            <PieChartCard title="Distribuição por valor" data={toChartData(b.byValue)} />
          </div>
          <PieChartCard
            title="Status de cessão"
            data={toChartData(b.byAssignment)}
            footnote="* Referente às propostas maiores que R$ 200"
          />
          <QueryBoundary query={overview}>
            {(o) => (
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            )}
          </QueryBoundary>
        </div>
      )}
    </QueryBoundary>
  )
}

export function DetailsContent({ kpi }: { kpi: WorkflowKpi }) {
  switch (kpi) {
    case 'integration':
      return <IntegrationDetails />
    case 'accounts':
      return <AccountsDetails />
    case 'cards':
      return <CardsDetails />
    case 'insurance':
      return <InsuranceDetails />
  }
}
