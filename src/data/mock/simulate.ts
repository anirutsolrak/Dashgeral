export interface DevFlags {
  delayMs: number | null
  forceError: boolean
}

export function readDevFlags(search: string): DevFlags {
  const params = new URLSearchParams(search)
  const raw = params.get('delay')
  const parsed = raw === null ? Number.NaN : Number(raw)
  return {
    delayMs: Number.isFinite(parsed) && parsed >= 0 ? parsed : null,
    forceError: params.get('error') === '1',
  }
}

export async function simulate<T>(produce: () => T): Promise<T> {
  const search = typeof window === 'undefined' ? '' : window.location.search
  const { delayMs, forceError } = readDevFlags(search)
  const wait = delayMs ?? 200 + Math.floor(Math.random() * 400)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  if (forceError) throw new Error('Falha simulada')
  return produce()
}
