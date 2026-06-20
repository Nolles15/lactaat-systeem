// Invoer-helpers: parsen/valideren van wat de testleider intikt, naar de rekeneenheid.
// Pure functies, los testbaar — zodat de validatie hard te verifiëren is (ADR-0002).
// Eenheden: lopen → snelheid (km/u) bij invoer, pace bij uitvoer (ADR-0010). Intern: km/u.

import { kmhToPace } from './rekenkern'
import type { SportType } from './types'

/** Bovengrens voor een plausibele lactaatwaarde; daarboven fail-visible waarschuwen (ADR-0002). */
export const LACTAAT_MAX = 15

/** Label voor de intensiteitskolom (invoer), afhankelijk van de sport. */
export function intensiteitLabel(sport: SportType): string {
  return sport === 'running' ? 'Snelheid (km/u)' : 'Vermogen (W)'
}

/** Voorbeeld-invoer (placeholder) per sport. */
export function intensiteitPlaceholder(sport: SportType): string {
  return sport === 'running' ? 'bijv. 12,5' : 'bijv. 250'
}

/**
 * Parse de ingevoerde intensiteit naar de rekeneenheid: Watt (fietsen) of km/u (lopen — snelheid,
 * direct ingevoerd; ADR-0010). Geeft null bij ongeldige of niet-positieve invoer.
 */
export function parseIntensiteit(_sport: SportType, raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Afgeleide weergave bij de invoer: bij lopen de pace naast de ingevoerde snelheid (ADR-0010).
 * Geeft null als er niets af te leiden valt (fietsen).
 */
export function intensiteitAfgeleid(sport: SportType, x: number): string | null {
  return sport === 'running' ? `${kmhToPace(x)} /km` : null
}

/**
 * Uitvoer-weergave van een intensiteit: Watt (fietsen) of pace primair + snelheid secundair
 * (lopen; ADR-0010).
 */
export function formatIntensiteit(sport: SportType, x: number, gewichtKg?: number | null): string {
  if (sport === 'running') {
    return `${kmhToPace(x)} /km (${x.toFixed(1).replace('.', ',')} km/u)`
  }
  const wkg =
    gewichtKg && gewichtKg > 0 ? ` (${(x / gewichtKg).toFixed(1).replace('.', ',')} W/kg)` : ''
  return `${Math.round(x)} W${wkg}`
}

/** Parse een lichaamsgewicht (kg). Optioneel; null = leeg/ongeldig. */
export function parseGewicht(raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Parse een lactaatwaarde (mmol/L). Komma of punt toegestaan. null = ongeldig. */
export function parseLactaat(raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** Parse een hartslag (bpm). Optioneel veld; null = leeg/ongeldig. */
export function parseHartslag(raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Parse een RPE (Borg 6–20). Optioneel; geldig binnen 6–20, anders null. */
export function parseRpe(raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n >= 6 && n <= 20 ? n : null
}
