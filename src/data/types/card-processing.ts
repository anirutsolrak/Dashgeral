export interface CardProcessingKpis {
  integrationRate: number
  accountsCreated: number
  cardsSent: number
  totalProposals: number
}

export interface IntegrationStats {
  ratePercent: number
  digitized: number
  notDigitized: number
}
export interface AccountsStats {
  ratePercent: number
  created: number
  notCreated: number
}
export interface CardsStats {
  sent: number
  notSent: number
  totalAccounts: number
}
export interface InsuranceStats {
  total: number
  withInsurance: number
  withoutInsurance: number
}

export interface CardProcessingOverview {
  integration: IntegrationStats
  accounts: AccountsStats
  cards: CardsStats
  insurance: InsuranceStats
}

export interface ReasonCount {
  reason: string
  count: number
}
export interface IntegrationReasons {
  stopReasons: ReasonCount[]
  nonDigitizedBreakdown: ReasonCount[]
}
export interface AccountReasons {
  created: ReasonCount[]
  notCreated: ReasonCount[]
}
export interface InsuranceBreakdown {
  byCoverage: ReasonCount[]
  byValue: ReasonCount[]
  byAssignment: ReasonCount[]
}

export interface TrendPoint {
  label: string
  value: number
}

export type WorkflowKpi = 'integration' | 'accounts' | 'cards' | 'insurance'
export interface OrgNode {
  id: string
  name: string
  role: string
  children: OrgNode[]
}
export interface FlowStep {
  id: string
  label: string
}
export interface WorkflowDoc {
  id: string
  title: string
  description: string
}
export interface WorkflowInfo {
  flow: FlowStep[]
  org: OrgNode
  docs: WorkflowDoc[]
}
