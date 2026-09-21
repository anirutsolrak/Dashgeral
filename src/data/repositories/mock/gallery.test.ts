import { beforeEach, describe, expect, it } from 'vitest'
import { mockGalleryRepository as repo } from './gallery'

describe('mockGalleryRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('serves the data of every library', async () => {
    expect((await repo.getRecharts()).trend).toHaveLength(12)
    expect((await repo.getEcharts()).funnel.length).toBeGreaterThan(0)
    expect((await repo.getMaps()).hubs.length).toBeGreaterThan(0)
    expect((await repo.getTables()).shipments).toHaveLength(60)
    expect((await repo.getFlow()).steps.length).toBeGreaterThan(0)
  })

  it('fails on demand with ?error=1', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await expect(repo.getRecharts()).rejects.toThrow('Falha simulada')
  })
})
