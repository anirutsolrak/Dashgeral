import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders label, value and optional hint', () => {
    render(<KPICard label="Taxa de integração" value="80,00%" hint="vs. mês anterior" />)
    expect(screen.getByText('Taxa de integração')).toBeInTheDocument()
    expect(screen.getByText('80,00%')).toBeInTheDocument()
    expect(screen.getByText('vs. mês anterior')).toBeInTheDocument()
  })
})
