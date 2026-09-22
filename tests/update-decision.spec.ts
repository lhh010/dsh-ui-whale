import { describe, expect, it } from 'vitest'
import { decideUpdate } from '../src/client/update-check.ts'

describe('decideUpdate: DSH-version-gated update notices', () => {
  it('local >= latest -> current', () => {
    expect(decideUpdate('v0.10.3', { latest: 'v0.10.3', dshVersion: '0.1.7-alpha.1', latestSupported: 'v0.10.3', compat: true }))
      .toEqual({ kind: 'current', tag: 'v0.10.3' })
    expect(decideUpdate('v0.11.0', { latest: 'v0.10.3', dshVersion: '0.1.7-alpha.1', latestSupported: 'v0.10.3', compat: true }))
      .toEqual({ kind: 'current', tag: 'v0.10.3' })
  })

  it('no compat data or no dsh version -> legacy plain update', () => {
    expect(decideUpdate('v0.10.2', { latest: 'v0.10.3' })).toEqual({ kind: 'available', tag: 'v0.10.3' })
    expect(decideUpdate('v0.10.2', { latest: 'v0.10.3', dshVersion: '0.1.7-alpha.1' })).toEqual({ kind: 'available', tag: 'v0.10.3' })
    expect(decideUpdate('v0.10.2', { latest: 'v0.10.3', dshVersion: '0.1.7-alpha.1', compat: false })).toEqual({ kind: 'available', tag: 'v0.10.3' })
  })

  it('latest supports the running dsh -> available', () => {
    expect(decideUpdate('v0.10.2', { latest: 'v0.10.3', dshVersion: '0.1.7-alpha.1', latestSupported: 'v0.10.3', compat: true }))
      .toEqual({ kind: 'available', tag: 'v0.10.3' })
  })

  it('latest needs a newer dsh and an intermediate update exists -> partial', () => {
    expect(decideUpdate('v0.10.2', { latest: 'v0.11.0', dshVersion: '0.1.6-alpha.2', latestSupported: 'v0.10.3', compat: true }))
      .toEqual({ kind: 'partial', tag: 'v0.10.3', blocked: 'v0.11.0', dshVersion: '0.1.6-alpha.2' })
  })

  it('latest needs a newer dsh and nothing newer supports this dsh -> blocked', () => {
    expect(decideUpdate('v0.10.3', { latest: 'v0.11.0', dshVersion: '0.1.6-alpha.2', latestSupported: 'v0.10.3', compat: true }))
      .toEqual({ kind: 'blocked', tag: 'v0.11.0', dshVersion: '0.1.6-alpha.2' })
  })

  it('latestSupported at or below local is treated as no supported update (blocked, not partial)', () => {
    expect(decideUpdate('v0.10.3', { latest: 'v0.11.0', dshVersion: '0.1.5-rc.2', latestSupported: 'v0.10.1', compat: true }))
      .toEqual({ kind: 'blocked', tag: 'v0.11.0', dshVersion: '0.1.5-rc.2' })
  })

  it('latestSupported newer than latest (CDN ahead of git) still reports available for that tag', () => {
    // The host clamps latestSupported to latest, but the client decision stays
    // correct if the clamp is ever bypassed: available, never above latest.
    expect(decideUpdate('v0.10.2', { latest: 'v0.10.3', dshVersion: '0.1.7-alpha.1', latestSupported: 'v0.11.0', compat: true }))
      .toEqual({ kind: 'available', tag: 'v0.10.3' })
  })
})
