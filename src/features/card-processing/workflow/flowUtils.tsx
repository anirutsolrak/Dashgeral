import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import type { LaidOutEdge, LaidOutNode } from './layout'

const NODE_WIDTH = 180
const NODE_HEIGHT = 56

export function toNode(n: LaidOutNode, direction: 'horizontal' | 'vertical'): Node {
  return {
    id: n.id,
    position: { x: n.x, y: n.y },
    initialWidth: NODE_WIDTH,
    initialHeight: NODE_HEIGHT,
    sourcePosition: direction === 'horizontal' ? Position.Right : Position.Bottom,
    targetPosition: direction === 'horizontal' ? Position.Left : Position.Top,
    style: { width: NODE_WIDTH },
    data: {
      label: (
        <div>
          <div className="text-sm font-medium">{n.label}</div>
          {n.role && <div className="text-xs opacity-70">{n.role}</div>}
        </div>
      ),
    },
  }
}

export const toEdge = (e: LaidOutEdge): Edge => ({
  ...e,
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
})
