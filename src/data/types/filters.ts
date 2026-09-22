import { z } from 'zod'

export const PERIODS = ['all', '7d', '30d', '90d', '12m'] as const
export const REGIONS = ['all', 'norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'] as const

export const globalFiltersSchema = z.object({
  period: z.enum(PERIODS).catch('all'),
  region: z.enum(REGIONS).catch('all'),
  agreementCategory: z.string().catch('all'),
  agreement: z.string().catch('all'),
  logisticsType: z.string().catch('all'),
  logisticsStep: z.string().catch('all'),
})

export type GlobalFilters = z.infer<typeof globalFiltersSchema>

export const DEFAULT_FILTERS: GlobalFilters = globalFiltersSchema.parse({})
