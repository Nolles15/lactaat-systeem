import { describe, it, expect } from 'vitest'
import { polyFit, poly, dmax, findLT1, findOBLA, paceToKmh, kmhToPace } from './rekenkern'

// Hand-verifieerbare cases: ze bewijzen de methode onafhankelijk van de oracle
// (ADR-0002) en vormen straks de basis van de CI-test-gate (§11).

describe('polyFit + poly', () => {
  it('herstelt een bekende polynoom y = 2 + 3x + x^2', () => {
    const xs = [0, 1, 2, 3, 4, 5]
    const ys = xs.map((x) => 2 + 3 * x + x * x)
    const c = polyFit(xs, ys, 2)!
    expect(c[0]).toBeCloseTo(2, 6)
    expect(c[1]).toBeCloseTo(3, 6)
    expect(c[2]).toBeCloseTo(1, 6)
    expect(poly(c, 6)).toBeCloseTo(2 + 18 + 36, 6)
  })

  it('geeft null bij te weinig punten voor de gevraagde graad', () => {
    expect(polyFit([1, 2], [1, 2], 4)).toBeNull()
  })
})

describe('dmax (LT2)', () => {
  it('vindt het loodrechte maximum van y = x^2 op [0,1] in x = 0.5', () => {
    // Lijn van (0,0) naar (1,1) is y = x; loodrechte afstand |x - x^2| is maximaal in x = 0.5.
    const c = [0, 0, 1] // y = x^2
    const r = dmax(c, 0, 1)
    expect(r.x).toBeCloseTo(0.5, 2)
    expect(r.y).toBeCloseTo(0.25, 2)
  })
})

describe('findLT1', () => {
  it('detecteert baseline + 1,0 mmol/L', () => {
    // poly = 2 + x → baseline (min eerste 3 ys) = 2, drempel = 3 → kruising in x = 1.
    const c = [2, 1]
    const ys = [2, 2.2, 2.5]
    const r = findLT1(c, ys, 0, 5)!
    expect(r.baseline).toBeCloseTo(2, 6)
    expect(r.thr).toBeCloseTo(3, 6)
    expect(r.x).toBeCloseTo(1, 2)
  })
})

describe('findOBLA', () => {
  it('vindt de kruising met 4,0 mmol/L', () => {
    const c = [0, 1] // y = x
    const r = findOBLA(c, 0, 8)!
    expect(r.x).toBeCloseTo(4, 2)
    expect(r.y).toBe(4)
  })

  it('geeft null als 4,0 mmol/L niet bereikt wordt', () => {
    const c = [0, 0.1] // y = 0.1x → max 0.8 op [0,8]
    expect(findOBLA(c, 0, 8)).toBeNull()
  })
})

describe('pace-conversie', () => {
  it('paceToKmh: 5:30 → 10,909 km/h', () => {
    expect(paceToKmh('5:30')).toBeCloseTo(10.909, 3)
  })

  it('kmhToPace: 10,909 → 5:30', () => {
    expect(kmhToPace(10.909)).toBe('5:30')
  })

  it('round-trip pace → km/h → pace blijft stabiel', () => {
    expect(kmhToPace(paceToKmh('4:00'))).toBe('4:00')
  })
})
