import { simulate } from '@/data/mock/simulate'
import type { CatalogRepository } from '@/data/repositories/catalog'
import type { AgreementCatalog } from '@/data/types/catalog'

const CATALOG: AgreementCatalog = {
  categories: [
    {
      id: 'governo',
      label: 'Governo',
      agreements: [
        { id: 'gov-estadual-a', label: 'Governo Estadual A' },
        { id: 'gov-estadual-b', label: 'Governo Estadual B' },
        { id: 'gov-federal', label: 'Governo Federal' },
      ],
    },
    {
      id: 'inss',
      label: 'INSS',
      agreements: [
        { id: 'inss-aposentados', label: 'INSS Aposentados' },
        { id: 'inss-pensionistas', label: 'INSS Pensionistas' },
      ],
    },
    {
      id: 'prefeitura',
      label: 'Prefeitura',
      agreements: [
        { id: 'pref-capital', label: 'Prefeitura da Capital' },
        { id: 'pref-interior', label: 'Prefeituras do Interior' },
      ],
    },
  ],
}

export const mockCatalogRepository: CatalogRepository = {
  getAgreementCatalog: () => simulate(() => CATALOG),
}
