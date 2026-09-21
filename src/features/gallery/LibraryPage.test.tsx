import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ExampleCard } from './ExampleCard'
import { getLibrary } from './libraries'
import { LibraryPage } from './LibraryPage'

describe('LibraryPage', () => {
  it('shows the library name, the "when to use" note and a way back', () => {
    renderWithProviders(
      <LibraryPage library={getLibrary('recharts')}>
        <ExampleCard title="Linha" description="Tendência ao longo do tempo.">
          conteúdo
        </ExampleCard>
      </LibraryPage>,
      { url: '/gallery/recharts?period=30d' },
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Recharts' })).toBeInTheDocument()
    expect(screen.getByText(/Quando usar:/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Galeria/ })).toHaveAttribute(
      'href',
      '/gallery?period=30d',
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Linha' })).toBeInTheDocument()
    expect(screen.getByText('Tendência ao longo do tempo.')).toBeInTheDocument()
  })
})
