import { describe, expect, it } from 'vitest'
import { readDevFlags } from './simulate'

describe('readDevFlags', () => {
  it('returns defaults with no params', () => {
    expect(readDevFlags('')).toEqual({ delayMs: null, forceError: false })
  })
  it('parses delay and error flags', () => {
    expect(readDevFlags('?delay=0&error=1')).toEqual({ delayMs: 0, forceError: true })
  })
  it('ignores a non numeric delay', () => {
    expect(readDevFlags('?delay=abc').delayMs).toBeNull()
  })
})
