# Camada de dados

Nenhuma página fala com um backend. Toda leitura passa por `repositories`
(`src/data/repositories/index.ts`), que hoje aponta para implementações mock.

## Como está organizado

- `types/`: um arquivo por domínio. Espelham as views que o painel original consumia.
- `repositories/<domínio>.ts`: a interface (o contrato) de cada domínio.
- `repositories/mock/<domínio>.ts`: a implementação mock, alimentada pelos geradores de `mock/`.
- `repositories/index.ts`: **o único ponto** que escolhe a implementação.
- `features/<domínio>/api.ts`: os hooks de leitura (TanStack Query) chamam `repositories.<domínio>`
  por `useDomainQuery`, cuja chave inclui os filtros globais e as flags de demonstração.

## Dados mock

- Geradores com PRNG de seed fixa (`mock/random.ts`): os números são idênticos em toda apresentação.
- Os filtros valem de verdade: período e região só escalam os volumes (`mock/scale.ts`); convênio e
  logística mudam a seed ou recortam os dados.
- `simulate()` (`mock/simulate.ts`) acrescenta latência de 200 a 600 ms. Na URL: `?delay=0` remove a
  latência e `?error=1` força erro, para demonstrar os estados de carregamento e de falha.
- Repositórios mock devolvem objetos novos a cada chamada (nunca constantes do módulo).
- A Galeria (`mock/gallery/`) ignora os filtros globais: são exemplos fixos.

## Trocando o mock por uma API real

1. Crie `repositories/api/<domínio>.ts` implementando a interface do domínio.
2. Valide a resposta com Zod antes de devolvê-la (o backend é uma fronteira externa).
3. Troque a implementação em `repositories/index.ts`. Páginas e hooks não mudam.

Exemplo para o domínio de estoque (`VITE_API_URL` vai no `.env`, veja `.env.example`):

```ts
import { z } from 'zod'
import type { InventoryRepository } from '@/data/repositories/inventory'
import type { GlobalFilters } from '@/data/types/filters'

const stockItem = z.object({
  key: z.enum(['cards', 'envelopes', 'letters']),
  label: z.string(),
  total: z.number(),
  available: z.number(),
  inTransit: z.number(),
  lost: z.number(),
})
const overview = z.object({ items: z.array(stockItem), totalLost: z.number() })
const trend = z.array(z.object({ label: z.string(), value: z.number() }))

async function get<T>(path: string, schema: z.ZodType<T>, filters: GlobalFilters): Promise<T> {
  const query = new URLSearchParams({ period: filters.period, region: filters.region })
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}?${query}`)
  if (!response.ok) throw new Error(`Falha ao carregar ${path} (HTTP ${response.status})`)
  return schema.parse(await response.json())
}

export const apiInventoryRepository: InventoryRepository = {
  getOverview: (filters) => get('/inventory/overview', overview, filters),
  getLossTrend: (filters) => get('/inventory/loss-trend', trend, filters),
}
```

Atenção aos testes: os testes de página importam `repositories` de `index.ts`. Depois da troca,
mantenha-os contra o mock (por exemplo, com `vi.mock('@/data/repositories', ...)` devolvendo os
`mock*Repository`), para que a suíte continue determinística e sem rede.
