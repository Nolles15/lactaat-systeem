// In-sessie datamodel (ADR-0012). Alles leeft in React-state; niets wordt opgeslagen
// (ADR-0001). Later netjes naar JSON met een versie-veld te serialiseren.

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

export function legeDeelnemer(): Deelnemer {
  return { naam: '', geboortedatum: '', geslacht: '', gewichtKg: '' }
}

export function legeTestMeta(datum: string): TestMeta {
  return { datum, testleider: '', notities: '' }
}

/** Naam is verplicht (ADR-0012): leeg = niet geldig voor een rapport. */
export function naamGeldig(naam: string): boolean {
  return naam.trim() !== ''
}
