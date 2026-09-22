import {
  buildAccountReasons,
  buildInsuranceBreakdown,
  buildIntegrationReasons,
} from '@/data/mock/breakdowns'
import { buildOverview } from '@/data/mock/overview'
import { buildTrend } from '@/data/mock/trend'
import { simulate } from '@/data/mock/simulate'
import { getWorkflowInfo } from '@/data/mock/workflows'
import type { CardProcessingRepository } from '@/data/repositories/card-processing'

export const mockCardProcessingRepository: CardProcessingRepository = {
  getOverview: (filters) => simulate(() => buildOverview(filters)),
  getIntegrationTrend: (filters) => simulate(() => buildTrend(filters)),
  getIntegrationReasons: (filters) => simulate(() => buildIntegrationReasons(filters)),
  getAccountReasons: (filters) => simulate(() => buildAccountReasons(filters)),
  getInsuranceBreakdown: (filters) => simulate(() => buildInsuranceBreakdown(filters)),
  getWorkflow: (kpi) => simulate(() => getWorkflowInfo(kpi)),
}
