# Dashgeral: template de apresentação de dashboards (design)

Data: 2026-09-21 · Branch: `modernize/template`

## Objetivo

Transformar o Dashgeral em um template de apresentação que mostra, com dados mocados, os tipos de ferramentas de visualização integráveis a dashboards. Sem dependência de banco ou backend.

## Decisões

- Formato: híbrido. Mantém os 4 domínios de negócio (cartões, financeiro, estoque, logística) e adiciona uma Galeria de componentes.
- Linguagem: TypeScript estrito.
- Repositório: este repo, branch `modernize/template`.
- Libs de visualização: Recharts, Apache ECharts, react-leaflet, TanStack Table, React Flow. Saem Chart.js, chartjs-plugin-datalabels, lodash, react-orgchart e @supabase/supabase-js.

## Stack

- Vite 7, React 19, TypeScript strict, Tailwind 4, React Router 7 (rotas lazy), TanStack Query, Zod.
- Ícones: `lucide-react` (substitui o Font Awesome global). Tema claro/escuro por CSS variables.
- Tooling: ESLint 9 (flat config), Prettier, Vitest, Testing Library, GitHub Actions (lint, typecheck, test, build).
- Remover do repo: `.env` (criar `.env.example`), `src/copia.css`, `src/pages/TESTE.jsx`, `.vite/`.

## Estrutura

```
src/
  app/            providers, router, layout (sidebar, header, filtros globais)
  features/
    card-processing/ financial/ inventory/ logistics/
    gallery/      uma rota por lib: recharts, echarts, maps, tables, flow
  shared/
    ui/           KPICard, Card, Modal, EmptyState, Skeleton, ErrorBoundary
    charts/       wrappers finos de Recharts/ECharts com tema único
    lib/          formatters (Intl pt-BR), utils
  data/
    types/        tipos por domínio
    repositories/ interfaces + mock/ (implementações) + index.ts
    mock/         geradores com seed fixa
```

Cada feature contém páginas, componentes, tipos e hooks de query próprios. `data/repositories/index.ts` é o único ponto que escolhe a implementação.

## Dados mock

- Um tipo e uma interface de repositório por domínio, espelhando as views atuais do Supabase (`view_contas_criadas`, `view_cartoes_enviados`, `view_taxa_integracao`, `view_propostas_seguro`, `view_casos_cessao`, `view_motivos_digitacao`, `view_cases_by_convenio` e afins).
- Geradores com PRNG de seed fixa: números idênticos em toda apresentação. Aplicam filtros de verdade (período, região, convênio).
- Latência simulada de 200 a 600 ms. `?delay=0` desliga; `?error=1` força erro para demonstrar o tratamento.
- Um README em `data/` explica como plugar uma API real implementando a interface.

## Filtros globais

- Vivem nos search params, lidos e escritos por `useGlobalFilters()` validado com Zod. Permitem deep link e botão voltar.
- Filtros específicos (logística, convênio) só aparecem nas rotas onde fazem sentido.

## Páginas

- Os 4 domínios são refatorados em seções pequenas. `CardProcessing` (1.086 linhas) é dividido. Usam Recharts, TanStack Table nas listagens, React Flow no lugar do organograma e react-leaflet no mapa do Brasil.
- Galeria: índice em cards e rotas `/gallery/recharts`, `/echarts`, `/maps`, `/tables`, `/flow`. Cada uma com 4 a 6 exemplos e uma nota de "quando usar esta lib". Lazy loading para não pesar ECharts e Leaflet no carregamento inicial.
- Layout: sidebar responsiva (substitui Navigation e Drawer), header, alternância de tema, skeletons. Datas e moedas em pt-BR via `Intl`.

## Testes e CI

- Unitários: geradores mock (determinismo e aplicação de filtros) e formatters.
- Componentes: KPICard e estados de loading/erro.
- CI no GitHub Actions: lint, typecheck, test, build.

## Fora de escopo

Autenticação, backend real, i18n com troca de idioma, testes E2E.

## Riscos

- O `.env` antigo continua no histórico do git. A chave é anon (pública por natureza), mas se o repo for apresentado a clientes, considerar repo novo ou reescrita de histórico.
- A migração de Tailwind 3 para 4 e de `react-orgchart` para React Flow altera o visual. Aceitável, pois as páginas são refatoradas de qualquer forma.
- As páginas atuais não foram lidas em detalhe. Os campos exatos dos tipos mock serão derivados delas durante a implementação.
