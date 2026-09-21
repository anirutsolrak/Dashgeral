import type { CardProcessingRepository } from './card-processing'
import type { CatalogRepository } from './catalog'
import { mockCardProcessingRepository } from './mock/card-processing'
import { mockCatalogRepository } from './mock/catalog'

export interface Repositories {
  cardProcessing: CardProcessingRepository
  catalog: CatalogRepository
}

// Único ponto de troca: para usar uma API real, substitua as implementações aqui.
export const repositories: Repositories = {
  cardProcessing: mockCardProcessingRepository,
  catalog: mockCatalogRepository,
}
