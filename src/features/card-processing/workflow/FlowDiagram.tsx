import { Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { FlowStep } from '@/data/types/card-processing'
import { toEdge, toNode } from './flowUtils'
import { layoutFlow } from './layout'

export function FlowDiagram({ steps, label }: { steps: FlowStep[]; label: string }) {
  const { nodes, edges } = useMemo(() => {
    const layout = layoutFlow(steps)
    return { nodes: layout.nodes.map((n) => toNode(n, 'horizontal')), edges: layout.edges.map(toEdge) }
  }, [steps])
  return (
    <div role="figure" aria-label={label} className="h-80 w-full rounded-lg border border-slate-200 dark:border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        colorMode="system"
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
