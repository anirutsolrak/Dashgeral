import { useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.contactCenter

export const useContactCenter = () =>
  useDomainQuery('contact-center', 'overview', (f) => repo.getOverview(f))
export const useTabulations = () =>
  useDomainQuery('contact-center', 'tabulations', (f) => repo.getTabulations(f))
export const useHourly = () => useDomainQuery('contact-center', 'hourly', (f) => repo.getHourly(f))
export const useOperators = () =>
  useDomainQuery('contact-center', 'operators', (f) => repo.getOperators(f))
export const useCallsByRegion = () =>
  useDomainQuery('contact-center', 'by-region', (f) => repo.getByRegion(f))
