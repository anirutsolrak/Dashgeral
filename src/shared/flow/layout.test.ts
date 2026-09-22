import { describe, expect, it } from 'vitest'
import type { OrgNodeInput } from './types'
import { layoutFlow, layoutOrg } from './layout'

const leaf = (id: string): OrgNodeInput => ({ id, name: id, role: 'Equipe', children: [] })
const tree: OrgNodeInput = {
  id: 'r',
  name: 'r',
  role: 'Gestão',
  children: [
    { id: 's', name: 's', role: 'Supervisão', children: [leaf('a1'), leaf('a2'), leaf('a3')] },
  ],
}

describe('layoutFlow', () => {
  it('places steps left to right, chained by edges', () => {
    const { nodes, edges } = layoutFlow([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ])
    expect(nodes.map((n) => n.x)).toEqual([0, 240, 480])
    expect(nodes.every((n) => n.y === 0)).toBe(true)
    expect(edges.map((e) => [e.source, e.target])).toEqual([
      ['a', 'b'],
      ['b', 'c'],
    ])
  })
  it('handles an empty list', () => {
    expect(layoutFlow([])).toEqual({ nodes: [], edges: [] })
  })
})

describe('layoutOrg', () => {
  const { nodes, edges } = layoutOrg(tree)
  const at = (id: string) => nodes.find((n) => n.id === id)
  it('creates one node per person and one edge per link, with y by depth', () => {
    expect(nodes).toHaveLength(5)
    expect(edges).toHaveLength(4)
    expect([at('r')?.y, at('s')?.y, at('a1')?.y]).toEqual([0, 140, 280])
  })
  it('spaces leaves and centers parents over their children', () => {
    expect([at('a1')?.x, at('a2')?.x, at('a3')?.x]).toEqual([0, 200, 400])
    expect(at('s')?.x).toBe(200)
    expect(at('r')?.x).toBe(200)
  })
  it('carries name and role', () => {
    expect(at('s')).toMatchObject({ label: 's', role: 'Supervisão' })
  })
})
