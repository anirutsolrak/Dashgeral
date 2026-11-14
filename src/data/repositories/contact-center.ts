import type {
  ContactCenterOverview,
  HourlyCalls,
  OperatorStat,
  RegionCalls,
  TabulationCount,
} from '@/data/types/contact-center'
import type { GlobalFilters } from '@/data/types/filters'

export interface ContactCenterRepository {
  getOverview(filters: GlobalFilters): Promise<ContactCenterOverview>
  getTabulations(filters: GlobalFilters): Promise<TabulationCount[]>
  getHourly(filters: GlobalFilters): Promise<HourlyCalls[]>
  getOperators(filters: GlobalFilters): Promise<OperatorStat[]>
  getByRegion(filters: GlobalFilters): Promise<RegionCalls[]>
}
