# Dashgeral: template de apresentação de dashboards

Template com dados 100% mock para mostrar tipos de visualização integráveis a dashboards.
Idioma da interface e do código de domínio: pt-BR.

## Comandos

- `npm run dev` (Vite), `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Flags de demonstração na URL: `?delay=0` (sem latência simulada) e `?error=1` (força erro).
- Antes de concluir qualquer tarefa: testes, typecheck, lint (**zero warnings**) e build limpos.

## Stack

Vite 7, React 19, TypeScript estrito (sem `any`), Tailwind 4, React Router 7, TanStack Query,
TanStack Table **v8** (fixado: o `@latest` é a v9, com API diferente), Recharts 3, `@xyflow/react`,
react-leaflet 5, Apache ECharts 6 (SVG, registro manual em `src/shared/echarts/core.ts`; só carrega na rota `/gallery/echarts`), Zod, Vitest + Testing Library.

## Arquitetura

- `src/app`: providers, rotas (lazy), layout, tema, filtros globais na URL (`useGlobalFilters`), `useDomainQuery`.
- `src/features/<domínio>`: páginas, hooks (`api.ts`), KPIs, detalhes. Domínios prontos: card-processing, financial, inventory, logistics. `src/features/gallery`: uma página por biblioteca (Recharts, ECharts, mapas, tabelas, fluxo) sobre dados de `data/mock/gallery`, sem filtros globais. `src/shared/echarts` (núcleo, tema, componente `EChart`) e `src/shared/flow` (nós e helpers do React Flow) são compartilhados.
- `src/data`: tipos, interfaces de repositório e implementações mock (`repositories/mock`). Geradores em `data/mock` com seed fixa (`seedFor`); período e região só escalam volumes.
- `src/shared`: UI, gráficos, mapa, formatters. **`shared` não importa de `app`, `data` nem de `features`.**
- `legacy/`: código antigo (JS + Supabase), só referência de leitura. Será removido no Plano 6.

## Convenções que já pegaram bugs

- Toda query passa por `useDomainQuery`: filtros **e** dev flags entram na chave. `simulate()` lê `window.location.search`.
- Números e moedas via `@/shared/lib/formatters` (Intl usa espaço não separável U+00A0; nos testes normalize com ` `).
- Repositórios mock devolvem cópias (nunca constantes do módulo por referência).
- Gráficos: cores por variáveis `--chart-*` (`src/index.css`) para funcionar nos dois temas. Legenda do Recharts precisa de `labelStyle`.
- Testes: `ResponsiveContainer` do Recharts e stubs do React Flow são globais (`src/test/setup.ts`); `react-leaflet` é mockado **só** nos arquivos que renderizam mapa (o jsdom não roda o renderizador do Leaflet). `asyncUtilTimeout` global de 5 s cobre os chunks lazy. Para exercitar o ResponsiveContainer real use vi.unmock('recharts') no topo do arquivo (sem layout o jsdom não renderiza o svg; ver src/test/recharts.real.test.tsx). Só faça isso quando o teste for sobre o container em si.
- `@latest` de dependência pode trazer major incompatível: confira a API instalada antes de usar o código do plano.

## Fluxo de trabalho usado

Spec e planos ficam em `docs/superpowers/` (spec em `specs/`, planos em `plans/`). Cada plano é escrito
com tarefas pequenas em TDD e executado tarefa a tarefa, com um implementador e um revisor por tarefa
e uma revisão final do plano inteiro. Não escrever arquivos com mais de ~150 linhas numa única chamada.

## Estado

- Prontos: Plano 1 (fundação), Plano 2 (Card Processing), Plano 3 (Financial + Inventory), Plano 4 (Logística: `/logistics`, filtros de tipo e etapa aplicados nos geradores), Plano 5 (Galeria: `/gallery` com `/recharts`, `/echarts`, `/maps`, `/tables`, `/flow`; ECharts em chunk lazy).
- Faltam (planos já escritos em `docs/superpowers/plans/`): **Plano 6** limpeza (remover `legacy/`, `public/vite.svg` e imagens antigas, `.gitattributes` com `eol=lf`, Prettier, README final).
- Pendências conhecidas: tiles do mapa ficam claros no tema escuro e exigem internet; foco visível nos botões de ação dos KPIs; o `.env` local antigo (chave anon do Supabase, ainda no histórico do git) deve ser apagado e a chave rotacionada.
- Backlog de consistência entre planos (achados na revisão do Plano 4): `selectClass` repetido em 3 filtros (extrair para `shared`); mensagens de status dos filtros sem variante `dark:` (corrigir em `AgreementFilters` e `LogisticsFilters` juntos); Inventory e Logistics não têm o filtro de convênio embora o `seedFor` dependa dele; os params `logisticsType`/`logisticsStep` vazam para as outras rotas e entram nas chaves de query; as barras Flash vs. Terceiros têm a mesma forma (fator 60/40); rótulos de etapa repetidos entre grupos (`optgroup` desambigua só com o select aberto).
