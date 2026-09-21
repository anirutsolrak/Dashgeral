import type { CardProcessingRepository } from './card-processing'
import { mockCardProcessingRepository } from './mock/card-processing'

export interface Repositories {
  cardProcessing: CardProcessingRepository
}

// Único ponto de troca: para usar uma API real, substitua as implementações aqui.
export const repositories: Repositories = {
  cardProcessing: mockCardProcessingRepository,
}
