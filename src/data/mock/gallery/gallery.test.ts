import { describe, expect, it } from 'vitest'
import { buildEchartsData } from './echarts'
import { buildFlowData } from './flow'
import { buildMapsData } from './maps'
import { buildRechartsData } from './recharts'
import { buildTablesData } from './tables'

describe.each([
  ['recharts', buildRechartsData],
  ['echarts', buildEchartsData],
  ['maps', buildMapsData],
  ['tables', buildTablesData],
  ['flow', buildFlowData],
])('%s data', (_name, build) => {
  it('is deterministic and returns fresh objects on every call', () => {
    expect(build()).toEqual(build())
    expect(build()).not.toBe(build())
  })
})

describe('buildRechartsData', () => {
  const d = buildRechartsData()
  it('has twelve months and consistent totals', () => {
    expect(d.trend).toHaveLength(12)
    expect(d.channelVolume).toHaveLength(12)
    expect(d.statusShare).toHaveLength(4)
    d.channelVolume.forEach((row, i) => {
      const sum = d.channels.reduce((s, c) => s + Number(row[c.key]), 0)
      expect(d.volumeVsTarget[i]).toMatchObject({ label: row.label, volume: sum })
      expect(Number(d.volumeVsTarget[i]!.meta)).toBeGreaterThan(0)
    })
  })
  it('has one radar row per axis and a value per unit between 0 and 100', () => {
    expect(d.unitPerformance).toHaveLength(5)
    for (const row of d.unitPerformance) {
      for (const u of d.units) expect(Number(row[u.key])).toBeGreaterThanOrEqual(0)
      for (const u of d.units) expect(Number(row[u.key])).toBeLessThanOrEqual(100)
    }
  })
})

describe('buildEchartsData', () => {
  const d = buildEchartsData()
  it('fills the whole heatmap grid inside its bounds', () => {
    expect(d.heatmap.cells).toHaveLength(d.heatmap.days.length * d.heatmap.hours.length)
    for (const [x, y, v] of d.heatmap.cells) {
      expect(x).toBeLessThan(d.heatmap.hours.length)
      expect(y).toBeLessThan(d.heatmap.days.length)
      expect(v).toBeGreaterThanOrEqual(0)
    }
  })
  it('has a strictly decreasing funnel and a gauge within its range', () => {
    const values = d.funnel.map((s) => s.value)
    expect(values).toEqual([...values].sort((a, b) => b - a))
    expect(new Set(values).size).toBe(values.length)
    expect(d.gauge.value).toBeGreaterThanOrEqual(0)
    expect(d.gauge.value).toBeLessThanOrEqual(d.gauge.max)
  })
  it('has a treemap with positive leaves and sankey links between known nodes', () => {
    const leaves = (nodes: typeof d.treemap): number[] =>
      nodes.flatMap((n) => (n.children ? leaves(n.children) : [n.value ?? 0]))
    expect(leaves(d.treemap).every((v) => v > 0)).toBe(true)
    const names = new Set(d.sankey.nodes.map((n) => n.name))
    for (const l of d.sankey.links) {
      expect(names.has(l.source) && names.has(l.target)).toBe(true)
      expect(l.value).toBeGreaterThan(0)
    }
  })
})

describe('buildMapsData', () => {
  const d = buildMapsData()
  it('has scores between 0 and 100 and routes between known hubs', () => {
    for (const p of [...d.regionScores, ...d.branchScores]) {
      expect(p.value).toBeGreaterThanOrEqual(0)
      expect(p.value).toBeLessThanOrEqual(100)
    }
    const ids = new Set(d.hubs.map((h) => h.id))
    for (const r of d.routes) expect(ids.has(r.from) && ids.has(r.to)).toBe(true)
    expect(d.coverage.every((c) => c.radiusKm > 0)).toBe(true)
  })
})

describe('buildTablesData', () => {
  const { shipments } = buildTablesData()
  it('has sixty shipments with unique ids and sane values', () => {
    expect(shipments).toHaveLength(60)
    expect(new Set(shipments.map((s) => s.id)).size).toBe(60)
    for (const s of shipments) {
      expect(['Entregue', 'Em trânsito', 'Devolvido', 'Extraviado']).toContain(s.status)
      expect(s.progress).toBeGreaterThanOrEqual(0)
      expect(s.progress).toBeLessThanOrEqual(100)
      expect(s.events.length).toBeGreaterThan(0)
    }
  })
})

describe('buildFlowData', () => {
  const d = buildFlowData()
  it('has connected graphs and labelled decision edges', () => {
    for (const g of [d.pipeline, d.decision]) {
      const ids = new Set(g.nodes.map((n) => n.id))
      for (const e of g.edges) expect(ids.has(e.source) && ids.has(e.target)).toBe(true)
    }
    expect(d.steps.length).toBeGreaterThanOrEqual(5)
    expect(d.decision.edges.some((e) => e.label)).toBe(true)
    expect(d.org.children.length).toBeGreaterThan(0)
  })
})
