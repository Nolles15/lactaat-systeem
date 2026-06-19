// Invoer-helpers: parsen/valideren van wat de testleider intikt, naar de rekeneenheid.
// Pure functies, los testbaar — zodat de validatie hard te verifiëren is (ADR-0002).

import { paceToKmh } from './rekenkern'
import type { SportType } from './types'

// "m:ss" of "mm:ss", seconden 0–59.
const PACE_RE = /^(\d{1,2}):([0-5]\d)$/

/** Bovengrens voor een plausibele lactaatwaarde; daarboven fail-visible waarschuwen (ADR-0002). */
export const LACTAAT_MAX = 15

/** Label voor de intensiteitskolom, afhankelijk van de sport. */
export function intensiteitLabel(sport: SportType): string {
  return sport === 'running' ? 'Tempo (min/km)' : 'Vermogen (W)'
}

/** Voorbeeld-invoer (placeholder) per sport. */
export function intensiteitPlaceholder(sport: SportType): string {
  return sport === 'running' ? 'bijv. 5:30' : 'bijv. 250'
}

/**
 * Parse de ingevoerde intensiteit naar de rekeneenheid: Watt (fietsen) of km/h (lopen,
 * via pace-conversie). Geeft null bij ongeldige of niet-positieve invoer.
 */
export function parseIntensiteit(sport: SportType, raw: string): number | null {
  const s = raw.trim()
  if (s === '') return null
  if (sport === 'running') {
    if (!PACE_RE.test(s)) return null
    return paceToKmh(s)
  }
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
