import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar, StatusBadge } from './cells'

describe('table cells', () => {
  it('shows the status as text', () => {
    render(<StatusBadge status="Extraviado" />)
    expect(screen.getByText('Extraviado')).toBeInTheDocument()
  })
  it('exposes the progress to assistive tech', () => {
    render(<ProgressBar value={72} />)
    const bar = screen.getByRole('progressbar', { name: 'Progresso da entrega' })
    expect(bar).toHaveAttribute('aria-valuenow', '72')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})
