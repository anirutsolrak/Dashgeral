import {
  buildContactCenter,
  buildHourly,
  buildOperators,
  buildRegionCalls,
  buildTabulations,
} from '@/data/mock/contact-center'
import { simulate } from '@/data/mock/simulate'
import type { ContactCenterRepository } from '@/data/repositories/contact-center'

export const mockContactCenterRepository: ContactCenterRepository = {
  getOverview: (filters) => simulate(() => buildContactCenter(filters)),
  getTabulations: (filters) => simulate(() => buildTabulations(filters)),
  getHourly: (filters) => simulate(() => buildHourly(filters)),
  getOperators: (filters) => simulate(() => buildOperators(filters)),
  getByRegion: (filters) => simulate(() => buildRegionCalls(filters)),
}
