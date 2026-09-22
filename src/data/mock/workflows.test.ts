import { describe, expect, it } from 'vitest'
import type { OrgNode, WorkflowKpi } from '@/data/types/card-processing'
import { getWorkflowInfo } from './workflows'

const KPIS: WorkflowKpi[] = ['integration', 'accounts', 'cards', 'insurance']
const flatten = (n: OrgNode): OrgNode[] => [n, ...n.children.flatMap(flatten)]

describe('getWorkflowInfo', () => {
  it.each(KPIS)('has a coherent flow, org chart and docs for %s', (kpi) => {
    const info = getWorkflowInfo(kpi)
    expect(info.flow).toHaveLength(5)
    expect(new Set(info.flow.map((s) => s.id)).size).toBe(5)
    const nodes = flatten(info.org)
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length)
    expect(info.docs.length).toBeGreaterThanOrEqual(1)
  })
  it('uses only generic role names (no real people)', () => {
    for (const kpi of KPIS) {
      for (const n of flatten(getWorkflowInfo(kpi).org)) {
        expect(n.name).toMatch(/^(Gestor Geral|Supervisor de Operações|Analista \d+)$/)
      }
    }
  })
  it('sizes the team per kpi', () => {
    const analysts = (k: WorkflowKpi) =>
      flatten(getWorkflowInfo(k).org).filter((n) => n.role === 'Equipe')
    expect(analysts('cards')).toHaveLength(6)
    expect(analysts('accounts')).toHaveLength(2)
  })
  it('docs array is copied (not shared by reference)', () => {
    const info1 = getWorkflowInfo('cards')
    const originalLength = info1.docs.length
    const originalFirstTitle = info1.docs[0]?.title

    info1.docs.push({ id: 'test', title: 'Test', description: 'Test desc' })
    if (info1.docs[0]) {
      info1.docs[0].title = 'Mutated Title'
    }

    const info2 = getWorkflowInfo('cards')
    expect(info2.docs).toHaveLength(originalLength)
    expect(info2.docs[0]?.title).toBe(originalFirstTitle)
  })
})
