# Plano 6: Fechamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar a migração: remover o código antigo (`legacy/`) e os assets órfãos, normalizar finais de linha e formatação (LF + Prettier, com checagem no CI), isolar `.claude/` das ferramentas e entregar a documentação final (README, `src/data/README.md`, `CLAUDE.md`).

**Architecture:** Plano de manutenção, sem mudança de comportamento. Cada tarefa é um commit independente e reversível (a Task 2 vem antes da reformatação para que o Prettier não toque nos worktrees em `.claude/`); a reformatação em massa fica isolada num commit próprio, registrado em `.git-blame-ignore-revs`, para não poluir o `git blame`.

**Tech Stack:** Prettier 3, ESLint 9, Vitest, GitHub Actions, Markdown.

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-showcase-template-design.md` (seções "Estrutura", "Dados mock" e "Riscos")

**Depende de:** Planos 1 a 5 (branch `modernize/template`). O CI (`.github/workflows/ci.yml`) já existe desde o Plano 1 e passa; este plano só acrescenta a checagem de formatação. Antes do Task 1, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` devem estar verdes.

## Global Constraints

- Nenhuma mudança de comportamento: a suíte de testes não pode ganhar nem perder casos por causa deste plano (exceto se uma tarefa disser o contrário).
- Cada tarefa termina com `npm test`, `npm run typecheck`, `npm run lint` (zero warnings) e `npm run build` verdes.
- Não reescrever histórico do git. A chave anon do Supabase que esteve no `.env` continua no histórico; isso é registrado na documentação (Task 4), não corrigido aqui.
- `docs/` continua fora de lint e Prettier (os planos citam caminhos de `legacy/` como registro histórico e não devem ser reescritos).
- Nenhum arquivo com mais de ~150 linhas escrito numa única chamada.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Mapa de arquivos

```
legacy/, public/vite.svg, public/assets/*   removidos                (Task 1)
index.html, eslint.config.js, .prettierignore, README.md, CLAUDE.md   referências a legacy/ (Task 1)
.claude/ isolado: eslint.config.js, .prettierignore, vite.config.ts             (Task 2)
.gitattributes, .git-blame-ignore-revs      novos                     (Task 3)
package.json, .github/workflows/ci.yml      script e passo format:check (Task 3)
README.md, src/data/README.md, CLAUDE.md    documentação final        (Task 4)
```

---

### Task 1: Remover `legacy/`, `public/vite.svg` e as imagens antigas

**Files:**
- Delete: `legacy/` (31 arquivos), `public/vite.svg`, `public/assets/Digitação Seguros.png`, `public/assets/fluxograma_integracao.png`
- Modify: `index.html`, `eslint.config.js`, `.prettierignore`, `README.md`, `CLAUDE.md`

**Interfaces:** nenhuma; só remoção e limpeza de referências.

- [ ] **Step 1: Provar que nada em `src` ou no build depende desses arquivos**

Run:

```bash
grep -rnE "legacy/|vite\.svg|public/assets|fluxograma_integracao|Digita" src index.html vite.config.ts tsconfig.json package.json
```

Expected: nenhuma linha. Se aparecer alguma, parar e resolver a dependência antes de apagar (não deve haver: as páginas novas usam React Flow e dados mock, sem imagens).

- [ ] **Step 2: Guardar como consultar o código antigo**

Anotar o hash do commit atual (`git rev-parse --short HEAD`); depois da remoção, o código antigo continua acessível com `git show <hash>:legacy/src/pages/Logistics.jsx`. Este hash entra no `CLAUDE.md` no Step 5.

- [ ] **Step 3: Remover os arquivos**

```bash
git rm -r legacy public/vite.svg public/assets
```

Se o `public/` ficar vazio, o Git deixa de rastrear a pasta e o Vite continua funcionando sem ela.

- [ ] **Step 4: Evitar o 404 do favicon**

Em `index.html`, dentro do `<head>` e depois da tag `<meta charset>`, acrescentar (o template não tem ícone próprio; isto evita a requisição a `/favicon.ico` durante as demonstrações):

```html
    <link rel="icon" href="data:," />
```

- [ ] **Step 5: Limpar as referências**

- `eslint.config.js`: na lista de `ignores`, trocar `['dist', 'legacy', 'docs']` por `['dist', 'docs']`.
- `.prettierignore`: remover a linha `legacy`.
- `README.md`: remover o item `legacy/` da seção "Estrutura" (a estrutura final é reescrita no Task 4).
- `CLAUDE.md`: remover a linha `legacy/` da seção "Arquitetura" e, na seção "Fluxo de trabalho usado", acrescentar: `Os planos citam caminhos de legacy/ (removido no Plano 6). Para ler o código antigo: git show <hash-do-Step-2>:legacy/src/pages/Logistics.jsx.` (substituir `<hash-do-Step-2>` pelo hash real).

- [ ] **Step 6: Verificar**

Run: `git ls-files legacy | wc -l` (deve imprimir `0`), `grep -rn "legacy" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs --exclude-dir=.claude .` (só pode restar a frase do `CLAUDE.md` do Step 5), depois `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
Expected: tudo verde; o `dist/` não referencia `vite.svg`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove legacy code and orphan public assets

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Isolar `.claude/` de ESLint, Prettier e Vitest

**Por quê:** os worktrees do Claude Code vivem em `.claude/worktrees/` dentro do repositório (e são ignorados pelo Git via `.git/info/exclude`). Rodando `npm test`, `npm run lint` ou `npm run format` no checkout principal, as ferramentas varrem também as cópias dos worktrees: testes duplicados, lint de arquivos fora do projeto e reformatação de código alheio.

**Files:**
- Modify: `eslint.config.js`, `.prettierignore`, `vite.config.ts`

**Interfaces:** nenhuma.

- [ ] **Step 1: Observar o problema (só se houver worktrees em `.claude/worktrees/`)**

Run: `npx vitest list 2>&1 | grep -c "\.claude/"` e `npx prettier --check . 2>&1 | grep -c "\.claude/"`
Expected: números maiores que zero enquanto houver worktrees; sem worktrees, zero, e o Step 4 vira só uma confirmação.

- [ ] **Step 2: Ignorar `.claude` no ESLint e no Prettier**

Em `eslint.config.js`, na lista de `ignores`, acrescentar `'.claude'` (fica `['dist', 'docs', '.claude']`). Em `.prettierignore`, acrescentar a linha `.claude`.

- [ ] **Step 3: Excluir `.claude` do Vitest**

Em `vite.config.ts`, importar `configDefaults` junto de `defineConfig` (`import { configDefaults, defineConfig } from 'vitest/config'`) e, no bloco `test`, acrescentar:

```ts
    exclude: [...configDefaults.exclude, '.claude/**'],
```

- [ ] **Step 4: Verificar**

Run: `npx vitest list 2>&1 | grep -c "\.claude/"`, `npx prettier --check . 2>&1 | grep -c "\.claude/"` e `npm run lint`
Expected: `0`, `0` e lint verde. Depois `npm test`, `npm run typecheck` e `npm run build` verdes.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js .prettierignore vite.config.ts
git commit -m "chore: keep .claude worktrees out of lint, format and test runs

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---
### Task 3: LF em todo o repositório, Prettier e checagem no CI

**Files:**
- Create: `.gitattributes`, `.git-blame-ignore-revs`
- Modify: `package.json` (script `format:check`), `.github/workflows/ci.yml`, e todos os arquivos que o Prettier reformatar

**Interfaces:**
- Produces: script `npm run format:check` (`prettier --check .`), passo de CI `npm run format:check`, `.gitattributes` com `* text=auto eol=lf`.

**Contexto:** o repositório é editado em Windows com `core.autocrlf=true`, e a configuração do Prettier (`.prettierrc`: sem ponto e vírgula, aspas simples, `printWidth: 100`, vírgula final) reprova a maior parte de `src`, seja por quebra de linha CRLF, seja por estilo. Em Linux (CI) o `prettier --check` reprovaria tudo.

- [ ] **Step 1: Medir o problema**

Run: `npx prettier --check . 2>&1 | tail -3` e `npx prettier --check --end-of-line auto . 2>&1 | tail -3`
Expected: a primeira mostra `Code style issues found in N files` com N alto; a segunda, com N menor (a diferença são arquivos que só divergem por CRLF). Registrar os dois números.

- [ ] **Step 2: Criar `.gitattributes`**

`.gitattributes`:

```
* text=auto eol=lf
```

- [ ] **Step 3: Script e passo de CI**

Em `package.json`, no bloco `scripts`, depois de `"format": "prettier --write ."`, acrescentar:

```json
    "format:check": "prettier --check ."
```

(lembrar da vírgula na linha anterior). Em `.github/workflows/ci.yml`, entre `- run: npm ci` e `- run: npm run lint`, acrescentar:

```yaml
      - run: npm run format:check
```

- [ ] **Step 4: Reformatar e renormalizar**

Run:

```bash
npm run format
git add --renormalize .
npm run format:check
```

Expected: o último comando termina sem avisos (`All matched files use Prettier code style!`). `git status --short` mostra muitos arquivos modificados, todos de formatação ou de fim de linha.

- [ ] **Step 5: Provar que nada mudou de comportamento**

Run: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`
Expected: a mesma contagem de testes de antes (anotada no início do plano) e tudo verde. Se o Prettier quebrou algum teste (por exemplo, uma string longa reformatada em um snapshot ou uma regra do ESLint sobre comentário `eslint-disable` que mudou de linha), corrigir no arquivo afetado e repetir.

- [ ] **Step 6: Commit da reformatação, separado**

```bash
git add -A
git commit -m "style: normalize line endings to LF and format the codebase with Prettier

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Ignorar esse commit no `git blame`**

Run: `git rev-parse HEAD` e criar `.git-blame-ignore-revs` com o hash completo e um comentário:

```
# style: normalize line endings to LF and format the codebase with Prettier
<hash completo do commit do Step 6>
```

Run: `git config blame.ignoreRevsFile .git-blame-ignore-revs` (o GitHub já lê esse arquivo sozinho) e depois:

```bash
git add .git-blame-ignore-revs
git commit -m "chore: ignore the formatting commit in git blame

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

Se o Step 4 tiver gerado também mudanças em `package.json` e `ci.yml` (Step 3), elas entram no commit do Step 6 junto com a reformatação, o que é aceitável; nesse caso mencionar no corpo do commit.

---


### Task 4: Documentação final: `src/data/README.md`, README e `CLAUDE.md`

**Files:**
- Create: `src/data/README.md`
- Modify: `README.md` (reescrever), `CLAUDE.md`

**Interfaces:** nenhuma; só documentação. O exemplo de repositório real do `src/data/README.md` precisa compilar (Step 2).

- [ ] **Step 1: Escrever `src/data/README.md`**

A spec pede este arquivo ("um README em `data/` explica como plugar uma API real implementando a interface"). Conteúdo:

````markdown
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
````

- [ ] **Step 2: Provar que o exemplo compila**

Criar temporariamente `src/data/repositories/api/inventory.ts` com o bloco `ts` acima, rodar `npm run typecheck` e `npm run lint`, e apagar o arquivo (`git rm -f` se já tiver sido adicionado). Expected: sem erros. Se o Zod instalado tipar `z.ZodType<T>` de outra forma, ajustar o exemplo no README até compilar; o documento nunca deve trazer código que não compila.

- [ ] **Step 3: Reescrever o `README.md`**

Escrever em duas passagens (~100 linhas no total). Conteúdo, em português:

- Título e resumo: template de apresentação de dashboards com dados 100% mock; sem banco nem backend.
- **Rodando:** `npm install`, `npm run dev`; tabela de scripts (`dev`, `build`, `preview`, `test`, `typecheck`, `lint`, `format`, `format:check`); Node 22 (mesmo do CI); flags de URL `?delay=0` e `?error=1`.
- **Páginas:** `/card-processing` (KPIs, tendência, detalhes e workflows em React Flow), `/financial` (mapa de desbloqueio, comparativos, tabela ordenável), `/inventory` (estoque e perdas), `/logistics` (status de entrega, filtros de tipo e etapa) e `/gallery` com `/gallery/recharts`, `/echarts`, `/maps`, `/tables`, `/flow` (cada uma com exemplos e a nota "quando usar"). Uma frase por página, dizendo qual biblioteca ela demonstra.
- **Estrutura:** `src/app` (providers, rotas lazy, layout, tema, filtros globais na URL), `src/features` (uma pasta por domínio e a Galeria), `src/data` (tipos, repositórios, mock; ver `src/data/README.md`), `src/shared` (UI, gráficos, mapas, fluxos, ECharts, formatters; não importa de `app`, `data` nem `features`).
- **Trocando mock por API real:** dois parágrafos curtos apontando para `src/data/README.md` (interface, Zod, `repositories/index.ts`).
- **Versões e cuidados:** TanStack Table fixado na **v8** (`^8.21`; o `@latest` do npm é a v9, com API diferente, então atualize com o guia de migração oficial e não com `npm update`); ECharts e Leaflet só carregam nas rotas que os usam; os tiles do mapa (OpenStreetMap) exigem internet e ficam claros no tema escuro.
- **Integração contínua:** o workflow `.github/workflows/ci.yml` roda `format:check`, `lint`, `typecheck`, `test` e `build` a cada push e pull request.
- **Histórico do git:** a versão anterior do projeto tinha um `.env` com a chave anon do Supabase, e ele continua no histórico. A chave é pública por natureza, mas quem for mostrar este repositório a clientes deve rotacioná-la no Supabase e, se preferir, publicar um repositório novo (sem histórico) ou reescrever o histórico.

Depois de escrever, rodar `npx prettier --write README.md src/data/README.md`.

- [ ] **Step 4: Atualizar o `CLAUDE.md`**

- Seção "Estado": trocar por `Todos os planos (1 a 6) concluídos.` e manter, como pendências conhecidas, só as que ainda valem: tiles do mapa claros no tema escuro e dependentes de internet; foco visível nos botões de ação dos KPIs; `.env` antigo no histórico do git com a chave anon do Supabase (rotacionar antes de mostrar o repositório).
- Seção "Comandos": acrescentar `npm run format` e `npm run format:check` (o CI roda o segundo).
- Seção "Convenções": acrescentar `Finais de linha LF (.gitattributes) e Prettier obrigatórios no CI; o commit de reformatação está em .git-blame-ignore-revs.`
- Seção "Arquitetura": conferir que menciona `src/features/gallery`, `src/shared/echarts` e `src/shared/flow` (o Plano 5 já acrescenta as duas primeiras; incluir a terceira se faltar) e que `src/data/README.md` é a referência para plugar uma API.

- [ ] **Step 5: Verificar e commitar**

Run: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
Expected: tudo verde (o Prettier formata os `.md` fora de `docs/`).

```bash
git add -A
git commit -m "docs: finalize README, data layer guide and CLAUDE.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Verificação final do template

**Files:** nenhum (só verificação).

**Interfaces:** nenhuma.

- [ ] **Step 1: A partir de uma instalação limpa, com os mesmos passos do CI**

Run: `npm ci && npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`
Expected: tudo passa. Rodar `npm test` uma segunda vez para confirmar que a suíte é estável.

- [ ] **Step 2: Higiene do repositório**

Run:

```bash
git ls-files | grep -E "(^|/)\.env$" ; git ls-files legacy | wc -l ; git status --short | wc -l
grep -rn "supabase" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs --exclude-dir=.claude -il .
```

Expected: nenhum `.env` rastreado; `0`; `0`; e o `grep` só pode listar `README.md` e `CLAUDE.md` (que citam o Supabase na nota do histórico) e nenhum arquivo de `src`. `package.json` não pode ter `@supabase/supabase-js`, `chart.js`, `lodash` nem `react-orgchart` (`grep -nE "supabase|chart\.js|lodash|orgchart" package.json`).

- [ ] **Step 3: Percorrer o produto pronto**

Run: `npm run preview` (usa o `dist/` do build) e abrir `http://localhost:4173/?delay=0`. Percorrer as 5 páginas da sidebar e as 5 rotas da Galeria nos dois temas e em 375 px de largura: sem erro no console, sem requisição a `vite.svg` ou `favicon.ico`, ECharts baixado só ao abrir `/gallery/echarts`, Leaflet só nas páginas com mapa. Conferir também `?error=1` em uma página de cada domínio.

- [ ] **Step 4: Fechamento**

Anotar no relatório os tamanhos dos chunks de `dist/assets`. Decidir com o dono do projeto como integrar `modernize/template` em `main` (PR ou merge direto); **não** fazer isso sem pedir.

---

## Self-Review

- **Cobertura do pedido e da spec:** remoção de `legacy/`, `public/vite.svg` e imagens antigas (Task 1); `.gitattributes` com `eol=lf` e Prettier nos arquivos reprovados, com `format:check` no CI para não regredir (Task 3); README com estrutura final, seção de trocar mock por API real e nota do TanStack Table v8 (Task 4); README em `src/data/` prometido pela spec, que ainda não existia (Task 4); nota de risco do `.env` no histórico, da seção "Riscos" da spec (Task 4). O CI em si já existia (Plano 1) e só ganha o passo de formatação.
- **Extra que não estava na lista:** a Task 2 isola `.claude/` de ESLint, Prettier e Vitest, porque os worktrees dentro do repositório fazem as ferramentas varrerem cópias do código (testes duplicados, lint alheio e reformatação de arquivos que não são do projeto quando se roda `npm run format` no checkout principal).
- **Ordem:** o isolamento de `.claude/` (Task 2) precede a reformatação em massa (Task 3) de propósito: com worktrees em `.claude/worktrees/`, `npm run format` no checkout principal reformataria cópias alheias.
- **Placeholders:** nenhum. O `<hash>` do Task 1 e o hash do commit no `.git-blame-ignore-revs` são valores que só existem na execução, e os passos dizem como obtê-los.
- **Riscos conhecidos:** a reformatação toca ~200 arquivos e pode expor um teste frágil (o Step 5 do Task 3 exige suíte com a mesma contagem e verde); o exemplo de API real depende da tipagem do Zod instalado (o Step 2 do Task 4 o compila antes de documentar); a chave do Supabase continua no histórico do git (só documentada, sem reescrita).
