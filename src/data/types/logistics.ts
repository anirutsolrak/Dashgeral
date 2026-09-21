export type LogisticsGroupKey =
  | 'entregue'
  | 'pendente'
  | 'custodia'
  | 'devolvido'
  | 'reenviado'
  | 'sinistrado'

export interface CatalogStep {
  id: string
  label: string
}
export interface CatalogGroup {
  key: LogisticsGroupKey
  label: string
  steps: CatalogStep[]
}
/** Ids dos tipos de logística; também são as chaves flash/terceiros de TypeComparisonRow. */
export type LogisticsTypeId = 'flash' | 'terceiros'

export interface LogisticsTypeOption {
  id: LogisticsTypeId
  label: string
}
export interface LogisticsCatalog {
  types: LogisticsTypeOption[]
  groups: CatalogGroup[]
}

export interface StepCount {
  id: string
  label: string
  count: number
}
export interface GroupStat {
  key: LogisticsGroupKey
  label: string
  count: number
  percent: number
  steps: StepCount[]
}
export interface LogisticsOverview {
  total: number
  groups: GroupStat[]
}
export interface TypeComparisonRow {
  key: LogisticsGroupKey
  label: string
  flash: number
  terceiros: number
}
