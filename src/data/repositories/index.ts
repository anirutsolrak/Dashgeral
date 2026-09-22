import type { CardProcessingRepository } from './card-processing'
import type { CatalogRepository } from './catalog'
import type { FinancialRepository } from './financial'
import type { GalleryRepository } from './gallery'
import type { InventoryRepository } from './inventory'
import type { LogisticsRepository } from './logistics'
import { mockCardProcessingRepository } from './mock/card-processing'
import { mockCatalogRepository } from './mock/catalog'
import { mockFinancialRepository } from './mock/financial'
import { mockGalleryRepository } from './mock/gallery'
import { mockInventoryRepository } from './mock/inventory'
import { mockLogisticsRepository } from './mock/logistics'

export interface Repositories {
  cardProcessing: CardProcessingRepository
  catalog: CatalogRepository
  financial: FinancialRepository
  gallery: GalleryRepository
  inventory: InventoryRepository
  logistics: LogisticsRepository
}

// Único ponto de troca: para usar uma API real, substitua as implementações aqui.
export const repositories: Repositories = {
  cardProcessing: mockCardProcessingRepository,
  catalog: mockCatalogRepository,
  financial: mockFinancialRepository,
  gallery: mockGalleryRepository,
  inventory: mockInventoryRepository,
  logistics: mockLogisticsRepository,
}
