import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/dom'

import { cloneElement, type ReactElement } from 'react'
import { vi } from 'vitest'

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement<{ width?: number; height?: number }> }) =>
      cloneElement(children, { width: 400, height: 300 }),
  }
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class DOMMatrixReadOnlyStub {
  m22: number
  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([0-9.]+)\)/)?.[1]
    this.m22 = scale ? Number(scale) : 1
  }
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)
vi.stubGlobal('DOMMatrixReadOnly', DOMMatrixReadOnlyStub)

configure({ asyncUtilTimeout: 5000 })
