import type { FlowStepInput, OrgNodeInput } from './types'

export interface LaidOutNode {
  id: string
  label: string
  role?: string
  x: number
  y: number
}
export interface LaidOutEdge {
  id: string
  source: string
  target: string
}
export interface Layout {
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
}

const FLOW_X_GAP = 240
const ORG_X_GAP = 200
const ORG_Y_GAP = 140

export function layoutFlow(steps: readonly FlowStepInput[]): Layout {
  return {
    nodes: steps.map((s, i) => ({ id: s.id, label: s.label, x: i * FLOW_X_GAP, y: 0 })),
    edges: steps.flatMap((s, i) => {
      const next = steps[i + 1]
      return next ? [{ id: `${s.id}-${next.id}`, source: s.id, target: next.id }] : []
    }),
  }
}

export function layoutOrg(root: OrgNodeInput): Layout {
  const nodes: LaidOutNode[] = []
  const edges: LaidOutEdge[] = []
  let nextLeaf = 0

  const place = (node: OrgNodeInput, depth: number): number => {
    const childXs = node.children.map((child) => {
      const x = place(child, depth + 1)
      edges.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id })
      return x
    })
    const x =
      childXs.length === 0
        ? nextLeaf++ * ORG_X_GAP
        : (Math.min(...childXs) + Math.max(...childXs)) / 2
    nodes.push({ id: node.id, label: node.name, role: node.role, x, y: depth * ORG_Y_GAP })
    return x
  }

  place(root, 0)
  return { nodes, edges }
}
