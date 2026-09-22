import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryStat } from './SummaryStat'

describe('SummaryStat', () => {
  it('renders label and value', () => {
    render(<SummaryStat label="Contas criadas" value="830" tone="green" />)
    expect(screen.getByText('Contas criadas')).toBeInTheDocument()
    expect(screen.getByText('830')).toBeInTheDocument()
  })
})
