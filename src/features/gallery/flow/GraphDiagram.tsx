import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { Graph, GraphNode } from '@/data/types/gallery'
import type { FlowTheme } from '@/shared/flow/types'

type StatusNodeData = { label: string; status?: GraphNode['status'] }
type StatusFlowNode = Node<StatusNodeData, 'status'>

const TONES = {
  ok: 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-200',
  warning: 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200',
  none: 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
} as const
const STATUS_TEXT = { ok: 'Normal', warning: 'Atenção', error: 'Crítico' } as const

function StatusNode({ data }: NodeProps<StatusFlowNode>) {
  return (
    <div className={`w-40 rounded-lg border-2 px-3 py-2 text-sm ${TONES[data.status ?? 'none']}`}>
      <Handle type="target" position={Position.Left} />
      <div className="font-medium">{data.label}</div>
      {data.status && <div className="text-xs opacity-80">{STATUS_TEXT[data.status]}</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Fora do componente: o React Flow exige identidade estável para `nodeTypes`.
const NODE_TYPES = { status: StatusNode }

interface GraphDiagramProps {
  graph: Graph
  label: string
  theme: FlowTheme
  interactive?: boolean
  minimap?: boolean
}

export function GraphDiagram({
  graph,
  label,
  theme,
  interactive = false,
  minimap = false,
}: GraphDiagramProps) {
  const nodes = useMemo<StatusFlowNode[]>(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: 'status',
        position: { x: n.x, y: n.y },
        initialWidth: 160,
        initialHeight: 52,
        data: { label: n.label, status: n.status },
      })),
    [graph],
  )
  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [graph],
  )
  return (
    <div
      role="figure"
      aria-label={label}
      className="h-80 w-full rounded-lg border border-slate-200 dark:border-slate-700"
    >
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        colorMode={theme}
      >
        <Background />
        <Controls showInteractive={false} />
        {minimap && <MiniMap pannable zoomable />}
      </ReactFlow>
    </div>
  )
}
