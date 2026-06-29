import { describe, it, expect } from 'vitest'
import { STANDAARD_CONFIG } from './analyse'
import type { Rij, Sessie, Vo2maxModule } from './sessie'
import { bouwRapportModel } from './rapportmodel'
import {
  vul,
  samenvattingZin,
  drempelBetekenis,
  curveBeschrijving,
  betrouwbaarheidZin,
  vo2maxZin,
  combinatieDuiding,
  drempelsConsistent,
} from './rapporttekst'

function rij(intensiteit: string, lactaat: string, hf: string): Rij {
  return { intensiteit, lactaat, hf, rpe: '', uitgesloten: false }
}

function vo2(vt1hr: number, vt2hr: number): Vo2maxModule {
  return {
    vo2max: { lPerMin: 3.46, mlPerKgMin: 54, pctVoorspeld: 96, hrPiek: 190 },
    vt1: { vo2LPerMin: 2.3, vo2MlPerKgMin: 36, hr: vt1hr },
    vt2: { vo2LPerMin: 3.0, vo2MlPerKgMin: 47, hr: vt2hr },
    veVco2: { vt2: 28, piek: 34 },
    bron: { apparaat: 'Cortex MetaSoft', bestand: 'lisa.xml' },
  }
}

function sessie(opts: { vo2max?: Vo2maxModule } = {}): Sessie {
  return {
    versie: 2,
    deelnemer: { naam: 'Lisa de Vries', geboortedatum: '1998-03-10', geslacht: 'vrouw', gewichtKg: '64' },
    test: { datum: '2026-06-15', testleider: 'Mark Jansen', notities: '', sport: 'cycling' },
    actief: { lactaat: true, vo2max: opts.vo2max !== undefined },
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
      ...(opts.vo2max ? { vo2max: opts.vo2max } : {}),
    },
  }
}

describe('vul', () => {
  it('vult bekende placeholders en laat onbekende staan', () => {
    expect(vul('Drempel {x} bij {y}', { x: '268 W', y: '170 bpm' })).toBe('Drempel 268 W bij 170 bpm')
    expect(vul('Hallo {naam}', {})).toBe('Hallo {naam}')
  })
})

describe('lactaat-zinnen', () => {
  const m = bouwRapportModel(sessie())

  it('samenvatting noemt de anaerobe drempel met W en bpm', () => {
    const z = samenvattingZin(m)!
    expect(z).toContain('W')
    expect(z).toMatch(/bpm/)
  })

  it('LT2-betekenis omschrijft het kantelpunt en gebruikt nergens "ModDmax"', () => {
    const z = drempelBetekenis(m, 'LT2')!
    expect(z.toLowerCase()).toContain('berekende kantelpunt')
    expect(z.toLowerCase()).not.toContain('moddmax')
    expect(z.toLowerCase()).not.toContain('dmax')
  })

  it('LT1-betekenis noemt de aerobe drempel', () => {
    expect(drempelBetekenis(m, 'LT1')!.toLowerCase()).toContain('aerobe drempel')
  })

  it('curve-beschrijving en betrouwbaarheid (hoge R²) zijn gevuld', () => {
    expect(curveBeschrijving(m)).toContain('lactaatcurve')
    const b = betrouwbaarheidZin(m)!
    expect(b).toContain('R²')
    expect(b).toContain('nauw')
  })

  it('is deterministisch (zelfde model → zelfde tekst)', () => {
    expect(samenvattingZin(m)).toBe(samenvattingZin(bouwRapportModel(sessie())))
  })
})

describe('VO₂max-zin', () => {
  it('noemt ml/kg/min, L/min en de %-voorspeld-uitleg', () => {
    const z = vo2maxZin(bouwRapportModel(sessie({ vo2max: vo2(140, 172) })))!
    expect(z).toContain('54 ml/kg/min')
    expect(z).toContain('3,5 L/min')
    expect(z).toContain('96%')
    expect(z.toLowerCase()).toContain('referentiewaarde')
  })
})

describe('combinatie-duiding (consistent vs uiteenlopend)', () => {
  // Leid de VT-hartslagen af van de werkelijke (geïnterpoleerde) LT-hartslagen, zodat de test
  // onafhankelijk is van de exacte interpolatie en alleen het consistent/uiteen-gedrag toetst.
  const base = bouwRapportModel(sessie())
  const lt1hr = Math.round(base.lactaat!.drempels.find((d) => d.code === 'LT1')!.hr!)
  const lt2hr = Math.round(base.lactaat!.drempels.find((d) => d.code === 'LT2')!.hr!)

  it('drempels dicht bij elkaar → "bevestigen elkaar"', () => {
    const m = bouwRapportModel(sessie({ vo2max: vo2(lt1hr + 2, lt2hr + 1) }))
    expect(drempelsConsistent(m)).toBe(true)
    expect(combinatieDuiding(m)!.toLowerCase()).toContain('bevestigen elkaar')
  })

  it('drempels ver uit elkaar → neutrale uiteenloop-duiding', () => {
    const m = bouwRapportModel(sessie({ vo2max: vo2(lt1hr + 15, lt2hr - 15) }))
    expect(drempelsConsistent(m)).toBe(false)
    const z = combinatieDuiding(m)!.toLowerCase()
    expect(z).toContain('verder uit elkaar')
    expect(z).not.toContain('beter')
    expect(z).not.toContain('slecht')
  })
})

describe('fail-visible / defensief', () => {
  it('geen lactaat-module → lactaat-zinnen zijn null', () => {
    const geenLactaat: Sessie = { ...sessie(), actief: { lactaat: false, vo2max: true }, modules: { vo2max: vo2(140, 172) } }
    const m = bouwRapportModel(geenLactaat)
    expect(samenvattingZin(m)).toBeNull()
    expect(drempelBetekenis(m, 'LT2')).toBeNull()
    expect(betrouwbaarheidZin(m)).toBeNull()
  })

  it('geen VO₂max → vo2maxZin en combinatie-duiding zijn null', () => {
    const m = bouwRapportModel(sessie())
    expect(vo2maxZin(m)).toBeNull()
    expect(combinatieDuiding(m)).toBeNull()
    expect(drempelsConsistent(m)).toBeNull()
  })
})
