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

export interface Sessie {
  versie: number
  deelnemer: Deelnemer
  test: TestData
  modules: {
    lactaat?: LactaatModule
    // vo2max?: ... (Deel B — aparte ronde)
  }
}

export const SESSIE_VERSIE = 1

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
    modules: { lactaat: legeLactaatModule() },
  }
}

/** Naam is verplicht (ADR-0012): leeg = niet geldig voor een rapport/export. */
export function naamGeldig(naam: string): boolean {
  return naam.trim() !== ''
}
