# Dashgeral

Template de apresentação de dashboards com dados mock. Mostra os tipos de visualização
que dá para integrar a um painel (gráficos, mapas, tabelas, fluxos), sem depender de banco.

## Rodando

    npm install
    npm run dev

Flags de demonstração na URL: `?delay=0` remove a latência simulada; `?error=1` força erro.

## Estrutura

- `src/app`: providers, rotas, layout e filtros globais (na URL).
- `src/features`: uma pasta por domínio.
- `src/data`: tipos, interfaces de repositório e implementações mock (seed fixa).
- `src/shared`: UI, formatters e utilitários.
- `legacy/`: código antigo (JS + Supabase), mantido só como referência até o Plano 6.

## Páginas

- `/card-processing`: KPIs com resumo, tendência de integração, detalhamento por KPI (barras e pizzas)
  e workflows (fluxograma e organograma em React Flow, lista de POPs). Filtros de período, região,
  categoria e convênio.
- `/financial`, `/inventory`, `/logistics`, `/gallery`: em migração.

## Trocando mock por API real

Implemente as interfaces de `src/data/repositories/*.ts` e troque as implementações em
`src/data/repositories/index.ts`. Nenhuma página precisa mudar.
