import { describe, it, expect } from 'vitest'
import { analyseer, kiesGraad, kiesGraadAIC, STANDAARD_CONFIG, type AnalyseConfig } from './analyse'

const cfg = (over: Partial<AnalyseConfig> = {}): AnalyseConfig => ({ ...STANDAARD_CONFIG, ...over })

describe('kiesGraad', () => {
  it('volgt de briefing-regel (4 vanaf 6 punten, anders 3)', () => {
    expect(kiesGraad(6)).toBe(4)
    expect(kiesGraad(5)).toBe(3)
    expect(kiesGraad(4)).toBe(3)
    expect(kiesGraad(3)).toBe(2)
    expect(kiesGraad(2)).toBeNull()
  })
})

describe('analyseer', () => {
  // Oplopende, gladde lactaatcurve: y = 1 + 0.0001·(x−100)²
  const stappen = [100, 150, 200, 250, 300, 350].map((x) => ({
    x,
    y: 1 + 0.0001 * (x - 100) ** 2,
  }))

  it('fit de curve goed en vindt LT1/LT2/OBLA', () => {
    const a = analyseer({ rust: 1.0, stappen, config: cfg() })
    expect(a.coef).not.toBeNull()
    expect(a.r2!).toBeGreaterThan(0.999)
    expect(a.drempels.lt2).not.toBeNull()
    expect(a.drempels.lt1).not.toBeNull()
    expect(a.drempels.obla).not.toBeNull()
    expect(a.drempels.obla!.y).toBe(4)
    expect(a.meetpunten[0]).toEqual({ x: 0, y: 1.0 })
    expect(a.graadAdvies).not.toBeNull()
  })

  it('waarschuwt en stopt bij te weinig punten', () => {
    const a = analyseer({ rust: null, stappen: [{ x: 100, y: 1 }, { x: 200, y: 2 }], config: cfg() })
    expect(a.coef).toBeNull()
    expect(a.waarschuwingen.join(' ')).toMatch(/te weinig/i)
  })

  it('OBLA-niveau instelbaar: niveau 3 wel, niveau 4 niet bereikt', () => {
    const laag = [100, 150, 200, 250, 300, 350].map((x) => ({ x, y: 1 + 4e-5 * (x - 100) ** 2 }))
    expect(analyseer({ rust: 1, stappen: laag, config: cfg({ oblaNiveau: 3 }) }).drempels.obla).not.toBeNull()
    expect(analyseer({ rust: 1, stappen: laag, config: cfg({ oblaNiveau: 4 }) }).drempels.obla).toBeNull()
  })

  it('LT1-delta instelbaar: grotere delta → drempel bij hogere intensiteit', () => {
    const klein = analyseer({ rust: 1, stappen, config: cfg({ lt1Delta: 0.5 }) }).drempels.lt1!
    const groot = analyseer({ rust: 1, stappen, config: cfg({ lt1Delta: 1.5 }) }).drempels.lt1!
    expect(groot.x).toBeGreaterThan(klein.x)
  })

  it('Modified-Dmax start later dan Dmax bij een vlakke start', () => {
    const data = [
      { x: 100, y: 1.0 },
      { x: 150, y: 1.05 },
      { x: 200, y: 1.1 },
      { x: 250, y: 1.6 }, // eerste stijging > 0,4 → start = vorige punt (x=200)
      { x: 300, y: 2.6 },
      { x: 350, y: 4.2 },
    ]
    const dmax = analyseer({ rust: 1, stappen: data, config: cfg({ lt2Methode: 'dmax' }) })
    const mod = analyseer({ rust: 1, stappen: data, config: cfg({ lt2Methode: 'moddmax' }) })
    expect(dmax.lt2Lijn!.start.x).toBe(100)
    expect(mod.lt2Lijn!.start.x).toBe(200)
  })
})

describe('kiesGraadAIC', () => {
  it('adviseert een haalbare graad voor een gladde curve', () => {
    const xs = [100, 150, 200, 250, 300, 350]
    const ys = xs.map((x) => 1 + 0.0001 * (x - 100) ** 2)
    const g = kiesGraadAIC(xs, ys)
    expect(g).not.toBeNull()
    expect(g!).toBeGreaterThanOrEqual(2)
    expect(g!).toBeLessThanOrEqual(4)
  })
})
