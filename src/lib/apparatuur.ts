// Apparatuur wordt automatisch afgeleid van de sport (ADR-0012) en komt op het rapport.
// TODO: de eigenaar levert de exacte apparatuur per sport/modus; dit zijn placeholders.

import type { SportType } from './types'

const APPARATUUR: Record<SportType, string> = {
  cycling: 'Fietsergometer (nog in te vullen)',
  running: 'Loopband (nog in te vullen)',
  rowing: 'Roeiergometer (nog in te vullen)',
}

export function apparatuurVoor(sport: SportType): string {
  return APPARATUUR[sport]
}
