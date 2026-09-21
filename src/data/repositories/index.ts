import type { CardProcessingRepository } from './card-processing'
import type { CatalogRepository } from './catalog'
import type { FinancialRepository } from './financial'
import { mockCardProcessingRepository } from './mock/card-processing'
import { mockCatalogRepository } from './mock/catalog'
import { mockFinancialRepository } from './mock/financial'

export interface Repositories {
  cardProcessing: CardProcessingRepository
  catalog: CatalogRepository
  financial: FinancialRepository
}

// Único ponto de troca: para usar uma API real, substitua as implementações aqui.
export const repositories: Repositories = {
  cardProcessing: mockCardProcessingRepository,
  catalog: mockCatalogRepository,
  financial: mockFinancialRepository,
}
