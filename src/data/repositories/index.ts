import type { CardProcessingRepository } from './card-processing'
import type { CatalogRepository } from './catalog'
import type { FinancialRepository } from './financial'
import type { InventoryRepository } from './inventory'
import { mockCardProcessingRepository } from './mock/card-processing'
import { mockCatalogRepository } from './mock/catalog'
import { mockFinancialRepository } from './mock/financial'
import { mockInventoryRepository } from './mock/inventory'

export interface Repositories {
  cardProcessing: CardProcessingRepository
  catalog: CatalogRepository
  financial: FinancialRepository
  inventory: InventoryRepository
}

// Único ponto de troca: para usar uma API real, substitua as implementações aqui.
export const repositories: Repositories = {
  cardProcessing: mockCardProcessingRepository,
  catalog: mockCatalogRepository,
  financial: mockFinancialRepository,
  inventory: mockInventoryRepository,
}
