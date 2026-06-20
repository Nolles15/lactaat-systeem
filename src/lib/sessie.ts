// In-sessie datamodel (ADR-0012/0014). Alles leeft in React-state; niets wordt opgeslagen
// (ADR-0001). Eén Sessie met een modules-map maakt 'óf lactaat, óf VO2max, óf beide' mogelijk
// en is store-ready voor latere versioned JSON.

import { STANDAARD_CONFIG, type AnalyseConfig } from './analyse'
import type { SportType } from './types'

export type Geslacht = '' | 'man' | 'vrouw' | 'anders'

export interface Deelnemer {
  naam: string
  geboortedatum: string // ISO yyyy-mm-dd of ''
  geslacht: Geslacht
  gewichtKg: string // ruwe invoer (W/kg, later)
}

export interface TestMeta {
  datum: string // ISO yyyy-mm-dd
  testleider: string
  notities: string
}

/** Test-metadata in de sessie (TestMeta + de sport). */
export interface TestData extends TestMeta {
  sport: SportType
}

/** Eén ingevoerde meetstap (ruwe strings; parsen gebeurt in invoer.ts/analyse.ts). */
export interface Rij {
  intensiteit: string
  lactaat: string
  hf: string
  rpe: string
  uitgesloten: boolean
}

export function legeRijen(n: number): Rij[] {
  return Array.from({ length: n }, () => ({
    intensiteit: '',
    lactaat: '',
    hf: '',
    rpe: '',
    uitgesloten: false,
  }))
}

/** De lactaat-testmodule binnen een sessie. */
export interface LactaatModule {
  rust: string
  meetpunten: Rij[]
  analyseConfig: AnalyseConfig
}

/** VO2max-module: beautified samenvatting uit de kar (ADR-0017). Geen ruwe stroom. */
export interface Vo2maxModule {
  vo2max: {
    lPerMin: number | null
    mlPerKgMin: number | null
    pctVoorspeld: number | null
    hrPiek: number | null
  }
  vt1: { vo2LPerMin: number | null; vo2MlPerKgMin: number | null; hr: number | null }
  vt2: { vo2LPerMin: number | null; vo2MlPerKgMin: number | null; hr: number | null }
  veVco2: { vt2: number | null; piek: number | null }
  bron: { apparaat: string; bestand: string }
}

export interface Sessie {
  versie: number
  deelnemer: Deelnemer
  test: TestData
  /** Welke testen tonen we (module-gestuurd scherm; ADR-0018). Optioneel → afleidbaar. */
  actief?: { lactaat: boolean; vo2max: boolean }
  modules: {
    lactaat?: LactaatModule
    vo2max?: Vo2maxModule
  }
}

export const SESSIE_VERSIE = 2

/** Effectief actieve modules: expliciete vlag, anders afgeleid van aanwezige data. */
export function actieveModules(s: Sessie): { lactaat: boolean; vo2max: boolean } {
  return {
    lactaat: s.actief?.lactaat ?? s.modules.lactaat !== undefined,
    vo2max: s.actief?.vo2max ?? s.modules.vo2max !== undefined,
  }
}

export function legeDeelnemer(): Deelnemer {
  return { naam: '', geboortedatum: '', geslacht: '', gewichtKg: '' }
}

export function legeTestMeta(datum: string): TestMeta {
  return { datum, testleider: '', notities: '' }
}

export function legeLactaatModule(): LactaatModule {
  return { rust: '', meetpunten: legeRijen(5), analyseConfig: STANDAARD_CONFIG }
}

export function legeSessie(datum: string): Sessie {
  return {
    versie: SESSIE_VERSIE,
    deelnemer: legeDeelnemer(),
    test: { datum, sport: 'cycling', testleider: '', notities: '' },
    actief: { lactaat: true, vo2max: false },
    modules: { lactaat: legeLactaatModule() },
  }
}

/** Naam is verplicht (ADR-0012): leeg = niet geldig voor een rapport/export. */
export function naamGeldig(naam: string): boolean {
  return naam.trim() !== ''
}
