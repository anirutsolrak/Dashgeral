import type {
  AccountReasons,
  CardProcessingKpis,
  CardProcessingOverview,
  InsuranceBreakdown,
  IntegrationReasons,
  TrendPoint,
  WorkflowInfo,
  WorkflowKpi,
} from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'

export interface CardProcessingRepository {
  getKpis(filters: GlobalFilters): Promise<CardProcessingKpis>
  getOverview(filters: GlobalFilters): Promise<CardProcessingOverview>
  getIntegrationTrend(filters: GlobalFilters): Promise<TrendPoint[]>
  getIntegrationReasons(filters: GlobalFilters): Promise<IntegrationReasons>
  getAccountReasons(filters: GlobalFilters): Promise<AccountReasons>
  getInsuranceBreakdown(filters: GlobalFilters): Promise<InsuranceBreakdown>
  getWorkflow(kpi: WorkflowKpi): Promise<WorkflowInfo>
}
