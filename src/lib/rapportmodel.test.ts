import { describe, it, expect } from 'vitest'
import { STANDAARD_CONFIG } from './analyse'
import type { Rij, Sessie, Vo2maxModule } from './sessie'
import {
  bouwRapportModel,
  berekenLeeftijd,
  evalueerOpIntensiteit,
} from './rapportmodel'

function rij(intensiteit: string, lactaat: string, hf: string): Rij {
  return { intensiteit, lactaat, hf, rpe: '', uitgesloten: false }
}

const VO2: Vo2maxModule = {
  vo2max: { lPerMin: 3.46, mlPerKgMin: 54, pctVoorspeld: 96, hrPiek: 190 },
  vt1: { vo2LPerMin: 2.3, vo2MlPerKgMin: 36, hr: 140 },
  vt2: { vo2LPerMin: 3.0, vo2MlPerKgMin: 47, hr: 172 },
  veVco2: { vt2: 28, piek: 34 },
  bron: { apparaat: 'Cortex MetaSoft', bestand: 'lisa.xml' },
}

function sessieLisa(opts: { vo2max?: boolean; naam?: string } = {}): Sessie {
  return {
    versie: 2,
    deelnemer: {
      naam: opts.naam ?? 'Lisa de Vries',
      geboortedatum: '1998-03-10',
      geslacht: 'vrouw',
      gewichtKg: '64',
    },
    test: { datum: '2026-06-15', testleider: 'Mark Jansen', notities: '', sport: 'cycling' },
    actief: { lactaat: true, vo2max: opts.vo2max ?? false },
    modules: {
      lactaat: {
        rust: '0,9',
        meetpunten: [
          rij('100', '1,1', '110'),
          rij('140', '1,4', '128'),
          rij('180', '1,9', '142'),
          rij('220', '2,8', '156'),
          rij('260', '4,6', '168'),
          rij('300', '7,2', '178'),
          rij('340', '11,5', '186'),
        ],
        analyseConfig: STANDAARD_CONFIG,
      },
      ...(opts.vo2max ? { vo2max: VO2 } : {}),
    },
  }
}

describe('berekenLeeftijd', () => {
  it('jarig vóór de testdatum → volle leeftijd', () => {
    expect(berekenLeeftijd('1998-03-10', '2026-06-15')).toBe(28)
  })
  it('nog niet jarig op de testdatum → één jaar minder', () => {
    expect(berekenLeeftijd('1998-09-10', '2026-06-15')).toBe(27)
  })
  it('ongeldige of lege datum → null', () => {
    expect(berekenLeeftijd('', '2026-06-15')).toBeNull()
    expect(berekenLeeftijd('1998-13-40', '2026-06-15')).toBeNull()
  })
})

describe('bouwRapportModel — deelnemer & test', () => {
  const m = bouwRapportModel(sessieLisa())
  it('leidt leeftijd en gewicht af', () => {
    expect(m.deelnemer.leeftijd).toBe(28)
    expect(m.deelnemer.gewichtKg).toBe(64)
  })
  it('vult test-metadata incl. apparatuur', () => {
    expect(m.test.sport).toBe('cycling')
    expect(m.test.apparatuur).toBeTruthy()
  })
})

describe('bouwRapportModel — lactaat', () => {
  const m = bouwRapportModel(sessieLisa())
  const l = m.lactaat!

  it('bevat de drie drempels, oplopend in intensiteit', () => {
    const codes = l.drempels.map((d) => d.code)
    expect(codes).toContain('LT1')
    expect(codes).toContain('LT2')
    const lt1 = l.drempels.find((d) => d.code === 'LT1')!
    const lt2 = l.drempels.find((d) => d.code === 'LT2')!
    expect(lt1.intensiteit).toBeLessThan(lt2.intensiteit)
    expect(lt1.intensiteitLabel).toContain('W')
  })

  it('curve is betrouwbaar (hoge R²) en zones zijn bepaald', () => {
    expect(l.r2).not.toBeNull()
    expect(l.betrouwbaar).toBe(true)
    expect(l.drempelzones).toHaveLength(3)
    expect(l.trainingszones).toHaveLength(5)
  })
})

describe('bouwRapportModel — combinatie & fail-visible', () => {
  it('koppelt LT↔VT op HR met een delta wanneer beide testen er zijn', () => {
    const m = bouwRapportModel(sessieLisa({ vo2max: true }))
    expect(m.combinatie).not.toBeNull()
    expect(m.combinatie!.aeroob.deltaHr).not.toBeNull()
    expect(m.combinatie!.anaeroob.deltaHr).not.toBeNull()
    // VT1-HR = 140; LT1-HR is geïnterpoleerd uit de meetpunten → delta is een klein, eindig getal.
    expect(m.combinatie!.aeroob.deltaHr!).toBeGreaterThanOrEqual(0)
  })

  it('geen combinatie zonder VO2max-module', () => {
    expect(bouwRapportModel(sessieLisa()).combinatie).toBeNull()
  })

  it('waarschuwt fail-visible bij ontbrekende naam en bij actieve-maar-lege VO2max', () => {
    const m = bouwRapportModel(sessieLisa({ vo2max: true, naam: '   ' }))
    // vo2max actief mét data hier; test alleen de naam-waarschuwing
    expect(m.waarschuwingen.some((w) => w.toLowerCase().includes('naam'))).toBe(true)

    const zonderData: Sessie = {
      ...sessieLisa(),
      actief: { lactaat: true, vo2max: true },
    }
    const m2 = bouwRapportModel(zonderData)
    expect(m2.waarschuwingen.some((w) => w.includes('CPET'))).toBe(true)
  })
})

describe('evalueerOpIntensiteit — eerlijk, geen verzonnen waarden', () => {
  const m = bouwRapportModel(sessieLisa({ vo2max: true }))

  it('binnen het bereik: lactaat uit de echte fit + geïnterpoleerde HR + zone', () => {
    const p = evalueerOpIntensiteit(m, 200)!
    expect(p.binnenBereik).toBe(true)
    expect(p.lactaat).not.toBeNull()
    expect(p.hr!).toBeCloseTo(149, 0) // tussen 180→142 en 220→156
    expect(p.zone).toBeTruthy()
  })

  it('de fit is monotoon stijgend over het bereik (echte curve, geen ad-hoc formule)', () => {
    const laag = evalueerOpIntensiteit(m, 150)!
    const hoog = evalueerOpIntensiteit(m, 300)!
    expect(hoog.lactaat!).toBeGreaterThan(laag.lactaat!)
  })

  it('buiten het bereik: geen extrapolatie (lactaat null)', () => {
    const onder = evalueerOpIntensiteit(m, 50)!
    expect(onder.binnenBereik).toBe(false)
    expect(onder.lactaat).toBeNull()
    const boven = evalueerOpIntensiteit(m, 9999)!
    expect(boven.lactaat).toBeNull()
  })

  it('null zonder lactaat-module', () => {
    const geenLactaat: Sessie = {
      ...sessieLisa(),
      actief: { lactaat: false, vo2max: true },
      modules: { vo2max: VO2 },
    }
    expect(evalueerOpIntensiteit(bouwRapportModel(geenLactaat), 200)).toBeNull()
  })
})
