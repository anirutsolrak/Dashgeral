import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { GalleryIndexPage } from './GalleryIndexPage'

describe('GalleryIndexPage', () => {
  it('lists one card per library with its example count', () => {
    renderWithProviders(<GalleryIndexPage />, { url: '/gallery' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Galeria de Componentes' }),
    ).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/gallery/recharts',
      '/gallery/echarts',
      '/gallery/maps',
      '/gallery/tables',
      '/gallery/flow',
    ])
    expect(screen.getByRole('link', { name: /Recharts/ })).toHaveTextContent('6 exemplos')
    expect(screen.getByRole('link', { name: /Apache ECharts/ })).toHaveTextContent('5 exemplos')
  })

  it('warns that global filters do not apply and keeps the query string in the links', () => {
    renderWithProviders(<GalleryIndexPage />, { url: '/gallery?period=30d' })
    expect(screen.getByText(/filtros globais não se aplicam/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Recharts/ })).toHaveAttribute(
      'href',
      '/gallery/recharts?period=30d',
    )
  })
})
