import type { GeoPoint, MapsData } from '@/data/types/gallery'
import { createRng } from '../random'

const REGIONS = [
  { id: 'norte', label: 'Norte', lat: -3.1, lng: -60.0 },
  { id: 'nordeste', label: 'Nordeste', lat: -8.0, lng: -38.0 },
  { id: 'centro-oeste', label: 'Centro-Oeste', lat: -15.8, lng: -47.9 },
  { id: 'sudeste', label: 'Sudeste', lat: -22.0, lng: -45.0 },
  { id: 'sul', label: 'Sul', lat: -27.5, lng: -51.5 },
]
const HUBS = [
  { id: 'sp', label: 'São Paulo', lat: -23.55, lng: -46.63 },
  { id: 'rj', label: 'Rio de Janeiro', lat: -22.9, lng: -43.17 },
  { id: 'bh', label: 'Belo Horizonte', lat: -19.92, lng: -43.94 },
  { id: 'bsb', label: 'Brasília', lat: -15.79, lng: -47.88 },
  { id: 'ssa', label: 'Salvador', lat: -12.97, lng: -38.5 },
  { id: 'rec', label: 'Recife', lat: -8.05, lng: -34.88 },
  { id: 'poa', label: 'Porto Alegre', lat: -30.03, lng: -51.23 },
  { id: 'mao', label: 'Manaus', lat: -3.12, lng: -60.02 },
]
const ROUTES: [string, string][] = [
  ['sp', 'rj'],
  ['sp', 'bh'],
  ['sp', 'poa'],
  ['bh', 'bsb'],
  ['bsb', 'ssa'],
  ['ssa', 'rec'],
  ['bsb', 'mao'],
  ['rj', 'ssa'],
]
const COVERAGE = [
  { id: 'sp', label: 'Grande São Paulo', lat: -23.55, lng: -46.63, base: 120 },
  { id: 'bh', label: 'Região de Belo Horizonte', lat: -19.92, lng: -43.94, base: 200 },
  { id: 'ssa', label: 'Recôncavo Baiano', lat: -12.97, lng: -38.5, base: 160 },
  { id: 'poa', label: 'Serra Gaúcha', lat: -30.03, lng: -51.23, base: 220 },
  { id: 'mao', label: 'Amazonas Central', lat: -3.12, lng: -60.02, base: 400 },
]

export function buildMapsData(): MapsData {
  const rng = createRng(5003)
  const score = (
    p: { id: string; label: string; lat: number; lng: number },
    unit: string,
  ): GeoPoint => {
    const value = rng.int(68, 96)
    return { ...p, value, detail: `${rng.int(8, 60)} ${unit}` }
  }
  return {
    regionScores: REGIONS.map((r) => score(r, 'agências ativas')),
    branchScores: HUBS.map((h) => score(h, 'entregas por dia (mil)')),
    hubs: HUBS.map((h) => ({ ...h })),
    routes: ROUTES.map(([from, to], i) => ({ id: `r${i}`, from, to, volume: rng.int(200, 2400) })),
    coverage: COVERAGE.map(({ base, ...c }) => ({
      ...c,
      radiusKm: Math.round(base * (0.9 + rng.next() * 0.2)),
      detail: `${rng.int(10, 80)} agências`,
    })),
  }
}
