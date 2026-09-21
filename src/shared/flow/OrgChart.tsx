import { Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { OrgNodeInput, FlowTheme } from './types'
import { toEdge, toNode } from './flowUtils'
import { layoutOrg } from './layout'

export function OrgChart({ root, label, theme }: { root: OrgNodeInput; label: string; theme: FlowTheme }) {
  const { nodes, edges } = useMemo(() => {
    const layout = layoutOrg(root)
    return { nodes: layout.nodes.map((n) => toNode(n, 'vertical')), edges: layout.edges.map(toEdge) }
  }, [root])
  return (
    <div role="figure" aria-label={label} className="h-96 w-full rounded-lg border border-slate-200 dark:border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        colorMode={theme}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
