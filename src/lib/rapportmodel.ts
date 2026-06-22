// Rapport-model: één afgeleide, render-klare structuur die alle al-berekende feiten van een sessie
// samenbrengt (ADR-0019). Dit is de single source of truth voor élke rapport-weergave (web of PDF,
// welke ontwerprichting dan ook). Doel: correctheid-eerst (CLAUDE.md §1) — het rapport toont nooit
// een ander getal dan de rekenkern berekent. Geen ad-hoc formules, geen verzonnen waarden:
// `evalueerOpIntensiteit` leest lactaat uit de échte fit en HR uit de échte meetpunten, en geeft
// niets terug wat niet eerlijk af te leiden is (bv. VO2 per Watt bestaat niet in de data → niet).

import { analyseer, interpoleerOpX, type Analyse, type LT2Methode } from './analyse'
import { poly } from './rekenkern'
import { drempelzones, trainingszones, zoneHr, type Zone } from './zones'
import { formatIntensiteit, parseGewicht, parseLactaat, stappenUitRijen } from './invoer'
import { apparatuurVoor } from './apparatuur'
import { actieveModules, naamGeldig, type Geslacht, type Sessie, type Vo2maxModule } from './sessie'
import type { SportType } from './types'

export interface RapportDeelnemer {
  naam: string
  /** Leeftijd op de testdatum, afgeleid uit geboortedatum + testdatum; null = onbekend. */
  leeftijd: number | null
  geslacht: Geslacht
  gewichtKg: number | null
}

export interface RapportTest {
  datum: string
  testleider: string
  sport: SportType
  notities: string
  apparatuur: string
}

export interface RapportDrempel {
  code: 'LT1' | 'LT2' | 'OBLA'
  intensiteit: number
  intensiteitLabel: string
  lactaat: number
  hr: number | null
  rpe: number | null
}

export interface RapportZone {
  code: string
  naam: string
  min: number | null
  max: number | null
  minLabel: string
  maxLabel: string
  hrMin: number | null
  hrMax: number | null
}

export interface RapportLactaat {
  drempels: RapportDrempel[]
  r2: number | null
  graad: number | null
  lt2Methode: LT2Methode
  drempelzones: RapportZone[]
  trainingszones: RapportZone[]
  /** R² ≥ 0,95: curve betrouwbaar genoeg om zonder voorbehoud te tonen (anders fail-visible). */
  betrouwbaar: boolean
  waarschuwingen: string[]
  /** Ruwe analyse voor de grafiek (curve, meetpunten, drempellijnen). */
  analyse: Analyse
}

/** Koppeling van een lactaat- en een ventilatoire drempel (alleen HR is bij beide vergelijkbaar). */
export interface DrempelKoppeling {
  lactaatHr: number | null
  vtHr: number | null
  /** |lactaatHr − vtHr| in bpm; null als één van beide ontbreekt. Feit, geen oordeel. */
  deltaHr: number | null
}

export interface RapportCombinatie {
  aeroob: DrempelKoppeling // LT1 ↔ VT1
  anaeroob: DrempelKoppeling // LT2 ↔ VT2
}

export interface RapportModel {
  deelnemer: RapportDeelnemer
  test: RapportTest
  actief: { lactaat: boolean; vo2max: boolean }
  lactaat: RapportLactaat | null
  vo2max: Vo2maxModule | null
  combinatie: RapportCombinatie | null
  /** Model-niveau fail-visible meldingen (ontbrekende naam/data). */
  waarschuwingen: string[]
}

/** Parse 'yyyy-mm-dd' naar onderdelen; null bij onbruikbare invoer. */
function parseISO(s: string): { jaar: number; maand: number; dag: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim())
  if (!m) return null
  const jaar = Number(m[1])
  const maand = Number(m[2])
  const dag = Number(m[3])
  if (maand < 1 || maand > 12 || dag < 1 || dag > 31) return null
  return { jaar, maand, dag }
}

/** Leeftijd op `opDatum`, puur uit de twee gegeven datums (geen systeemklok). null = onbekend. */
export function berekenLeeftijd(geboortedatum: string, opDatum: string): number | null {
  const g = parseISO(geboortedatum)
  const d = parseISO(opDatum)
  if (!g || !d) return null
  let leeftijd = d.jaar - g.jaar
  if (d.maand < g.maand || (d.maand === g.maand && d.dag < g.dag)) leeftijd--
  return leeftijd >= 0 && leeftijd < 130 ? leeftijd : null
}

function naarRapportZone(
  z: Zone,
  sport: SportType,
  gewichtKg: number | null,
  hfPunten: { x: number; v: number }[],
): RapportZone {
  const hr = zoneHr(hfPunten, z)
  return {
    code: z.code,
    naam: z.naam,
    min: z.min,
    max: z.max,
    minLabel: z.min !== null ? formatIntensiteit(sport, z.min, gewichtKg) : '—',
    maxLabel: z.max !== null ? formatIntensiteit(sport, z.max, gewichtKg) : '—',
    hrMin: hr.min,
    hrMax: hr.max,
  }
}

function bouwLactaat(
  analyse: Analyse,
  sport: SportType,
  gewichtKg: number | null,
): RapportLactaat {
  const d = analyse.drempels
  const drempels: RapportDrempel[] = []
  if (d.lt1)
    drempels.push({
      code: 'LT1',
      intensiteit: d.lt1.x,
      intensiteitLabel: formatIntensiteit(sport, d.lt1.x, gewichtKg),
      lactaat: d.lt1.y,
      hr: analyse.hr.lt1,
      rpe: analyse.rpe.lt1,
    })
  if (d.lt2)
    drempels.push({
      code: 'LT2',
      intensiteit: d.lt2.x,
      intensiteitLabel: formatIntensiteit(sport, d.lt2.x, gewichtKg),
      lactaat: d.lt2.y,
      hr: analyse.hr.lt2,
      rpe: analyse.rpe.lt2,
    })
  if (d.obla)
    drempels.push({
      code: 'OBLA',
      intensiteit: d.obla.x,
      intensiteitLabel: formatIntensiteit(sport, d.obla.x, gewichtKg),
      lactaat: d.obla.y,
      hr: analyse.hr.obla,
      rpe: analyse.rpe.obla,
    })

  let drempelz: RapportZone[] = []
  let trainingz: RapportZone[] = []
  if (d.lt1 && d.lt2) {
    const lt1 = d.lt1.x
    const lt2 = d.lt2.x
    drempelz = drempelzones(lt1, lt2).map((z) => naarRapportZone(z, sport, gewichtKg, analyse.hfPunten))
    trainingz = trainingszones(lt1, lt2).map((z) => naarRapportZone(z, sport, gewichtKg, analyse.hfPunten))
  }

  return {
    drempels,
    r2: analyse.r2,
    graad: analyse.graad,
    lt2Methode: analyse.lt2Methode,
    drempelzones: drempelz,
    trainingszones: trainingz,
    betrouwbaar: analyse.r2 !== null && analyse.r2 >= 0.95,
    waarschuwingen: analyse.waarschuwingen,
    analyse,
  }
}

/** Bouw het volledige rapport-model uit een sessie. Pure functie; geen IO, geen systeemklok. */
export function bouwRapportModel(sessie: Sessie): RapportModel {
  const actief = actieveModules(sessie)
  const sport = sessie.test.sport
  const gewichtKg = parseGewicht(sessie.deelnemer.gewichtKg)
  const waarschuwingen: string[] = []

  if (!naamGeldig(sessie.deelnemer.naam))
    waarschuwingen.push('Geen naam ingevuld — vul een naam in voor een volledig rapport.')

  // Lactaat-module → analyse → render-klare structuur.
  let lactaat: RapportLactaat | null = null
  if (actief.lactaat) {
    const mod = sessie.modules.lactaat
    if (mod) {
      const analyse = analyseer({
        rust: parseLactaat(mod.rust),
        stappen: stappenUitRijen(mod.meetpunten, sport),
        config: mod.analyseConfig,
      })
      lactaat = bouwLactaat(analyse, sport, gewichtKg)
    } else {
      waarschuwingen.push('Lactaat-test actief maar geen meetdata aanwezig.')
    }
  }

  // VO2max-module (al beautified; ADR-0017).
  const vo2max = actief.vo2max ? (sessie.modules.vo2max ?? null) : null
  if (actief.vo2max && !sessie.modules.vo2max)
    waarschuwingen.push('VO₂max-test actief maar geen CPET-data geïmporteerd.')

  // Gecombineerde conclusie: alleen als beide testen er zijn én de lactaatdrempels bepaald zijn.
  let combinatie: RapportCombinatie | null = null
  if (lactaat && vo2max) {
    const lt1 = lactaat.drempels.find((x) => x.code === 'LT1')
    const lt2 = lactaat.drempels.find((x) => x.code === 'LT2')
    if (lt1 && lt2) {
      combinatie = {
        aeroob: koppel(lt1.hr, vo2max.vt1.hr),
        anaeroob: koppel(lt2.hr, vo2max.vt2.hr),
      }
    }
  }

  return {
    deelnemer: {
      naam: sessie.deelnemer.naam,
      leeftijd: berekenLeeftijd(sessie.deelnemer.geboortedatum, sessie.test.datum),
      geslacht: sessie.deelnemer.geslacht,
      gewichtKg,
    },
    test: {
      datum: sessie.test.datum,
      testleider: sessie.test.testleider,
      sport,
      notities: sessie.test.notities,
      apparatuur: apparatuurVoor(sport),
    },
    actief,
    lactaat,
    vo2max,
    combinatie,
    waarschuwingen,
  }
}

function koppel(lactaatHr: number | null, vtHr: number | null): DrempelKoppeling {
  const deltaHr = lactaatHr !== null && vtHr !== null ? Math.abs(lactaatHr - vtHr) : null
  return { lactaatHr, vtHr, deltaHr }
}

export interface PuntOpIntensiteit {
  intensiteit: number
  /** Lactaat uit de échte gefitte curve; null buiten het testbereik (geen extrapolatie). */
  lactaat: number | null
  /** HR geïnterpoleerd uit de échte meetpunten; null buiten bereik of zonder HF-data. */
  hr: number | null
  /** 5-zone-code waarin deze intensiteit valt; null als zones niet bepaald zijn. */
  zone: string | null
  binnenBereik: boolean
}

/**
 * Eerlijke waarde-aflezing op een intensiteit x — de bouwsteen voor een interactieve scrubber.
 * Bewust GEEN VO2: die is in de data niet aan intensiteit (Watt) gekoppeld, dus elke VO2-per-Watt
 * zou verzonnen zijn (de fout die de mockup-jury in richting C ving). Liever niets dan een schijngetal.
 */
export function evalueerOpIntensiteit(model: RapportModel, x: number): PuntOpIntensiteit | null {
  const l = model.lactaat
  if (!l || !l.analyse.coef || l.analyse.curve.length === 0) return null
  const curve = l.analyse.curve
  const minX = curve[0].x
  const maxX = curve[curve.length - 1].x
  const binnenBereik = x >= minX && x <= maxX

  let zone: string | null = null
  for (const z of l.trainingszones) {
    const okMin = z.min === null || x >= z.min
    const okMax = z.max === null || x < z.max
    if (okMin && okMax) {
      zone = z.code
      break
    }
  }

  return {
    intensiteit: x,
    lactaat: binnenBereik ? poly(l.analyse.coef, x) : null,
    hr: interpoleerOpX(l.analyse.hfPunten, x),
    zone,
    binnenBereik,
  }
}
