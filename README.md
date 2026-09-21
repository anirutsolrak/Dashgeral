# Dashgeral

Template de apresentação de dashboards com dados 100% mock. Mostra os tipos de visualização que dá
para integrar a um painel (gráficos, mapas, tabelas, fluxos), sem banco de dados nem backend.

## Rodando

Requer Node 22 (o mesmo do CI).

    npm install
    npm run dev

| Script                 | O que faz                                 |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento (Vite)        |
| `npm run build`        | Checagem de tipos e build de produção     |
| `npm run preview`      | Serve o build de produção localmente      |
| `npm test`             | Testes (Vitest)                           |
| `npm run typecheck`    | Checagem de tipos (`tsc --noEmit`)        |
| `npm run lint`         | ESLint                                    |
| `npm run format`       | Formata o código com Prettier             |
| `npm run format:check` | Verifica a formatação (é o que o CI roda) |

Flags de demonstração na URL: `?delay=0` remove a latência simulada; `?error=1` força erro.

## Páginas

- `/card-processing`: KPIs, tendência, detalhes por KPI e workflows em React Flow (Recharts e React Flow).
- `/financial`: mapa de desbloqueio (react-leaflet), comparativos (Recharts) e tabela ordenável (TanStack Table).
- `/inventory`: estoque e perdas de cartões, envelopes e cartas berço, com detalhamento por item.
- `/logistics`: status de entrega, com filtros de tipo e etapa.
- `/gallery`: índice de exemplos, cada um com a nota "quando usar": `/gallery/recharts`,
  `/gallery/echarts` (Apache ECharts), `/gallery/maps` (Leaflet), `/gallery/tables` (TanStack Table)
  e `/gallery/flow` (React Flow).

## Estrutura

- `src/app`: providers, rotas lazy, layout, tema e filtros globais na URL.
- `src/features`: uma pasta por domínio, mais a Galeria.
- `src/data`: tipos, repositórios e mock (veja `src/data/README.md`).
- `src/shared`: UI, gráficos, mapas, fluxos, ECharts e formatters. Não importa de `app`, `data` nem `features`.

## Trocando mock por API real

Cada domínio tem uma interface em `src/data/repositories/<domínio>.ts`. Para usar um backend,
implemente a interface em `repositories/api/`, valide a resposta com Zod e troque a implementação em
`src/data/repositories/index.ts`. Nenhuma página nem hook precisa mudar.

O passo a passo, com um exemplo que compila, está em `src/data/README.md`.

## Versões e cuidados

- TanStack Table está fixado na **v8** (`^8.21`). O `@latest` do npm é a v9, com API diferente:
  atualize seguindo o guia de migração oficial, não com `npm update`.
- ECharts e Leaflet só carregam nas rotas que os usam.
- Os tiles do mapa (OpenStreetMap) exigem internet e ficam claros no tema escuro.

## Integração contínua

O workflow `.github/workflows/ci.yml` roda `format:check`, `lint`, `typecheck`, `test` e `build` a
cada push e pull request.

## Histórico do git

A versão anterior do projeto tinha um `.env` com a chave anon do Supabase, e ele continua no
histórico. A chave é pública por natureza, mas quem for mostrar este repositório a clientes deve
rotacioná-la no Supabase e, se preferir, publicar um repositório novo (sem histórico) ou reescrever
o histórico.
