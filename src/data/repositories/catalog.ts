import type { AgreementCatalog } from '@/data/types/catalog'

export interface CatalogRepository {
  getAgreementCatalog(): Promise<AgreementCatalog>
}
