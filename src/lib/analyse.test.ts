import { describe, it, expect } from 'vitest'
import { analyseer, kiesGraad } from './analyse'

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
    const a = analyseer({ rust: 1.0, stappen })
    expect(a.coef).not.toBeNull()
    expect(a.r2!).toBeGreaterThan(0.999)
    expect(a.drempels.lt2).not.toBeNull()
    expect(a.drempels.lt1).not.toBeNull()
    expect(a.drempels.obla).not.toBeNull()
    expect(a.drempels.obla!.y).toBe(4)
    // De ruststap zit als meetpunt (x=0) in de scatter, niet in de fit.
    expect(a.meetpunten[0]).toEqual({ x: 0, y: 1.0 })
  })

  it('waarschuwt en stopt bij te weinig punten', () => {
    const a = analyseer({ rust: null, stappen: [{ x: 100, y: 1 }, { x: 200, y: 2 }] })
    expect(a.coef).toBeNull()
    expect(a.waarschuwingen.join(' ')).toMatch(/te weinig/i)
  })

  it('meldt OBLA "niet bereikt" als 4,0 niet wordt gehaald', () => {
    const laag = [100, 150, 200, 250, 300, 350].map((x) => ({ x, y: 1 + 0.000005 * (x - 100) ** 2 }))
    const a = analyseer({ rust: 1.0, stappen: laag })
    expect(a.drempels.obla).toBeNull()
    expect(a.waarschuwingen.join(' ')).toMatch(/OBLA/)
  })
})
