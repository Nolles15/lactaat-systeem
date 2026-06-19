// Domeintypes voor de lactaattest. Startpunt uit de briefing (sectie 9),
// beperkt tot wat nu daadwerkelijk gebruikt wordt (CLAUDE.md §10).

export type SportType = 'cycling' | 'running' | 'rowing'
export type Unit = 'watt' | 'kmh' | 'pace' | 'watt500'

export interface DataPoint {
  intensity: number // intern altijd in rekeneenheid (Watt, of km/h voor lopen)
  intensityDisplay: string // weergave, bijv. "250 W" of "5:30 /km"
  lactate: number // mmol/L
  heartRate?: number // bpm
  rpe?: number // Borg 6–20
  time?: string // mm:ss stapduur
}

/** Een punt op de gefitte curve (intensiteit x, lactaat y). */
export interface Point {
  x: number
  y: number
}

/** LT1 met de gebruikte baseline en drempel, voor transparantie naar de testleider. */
export interface LT1Result extends Point {
  baseline: number
  thr: number
}

export interface ThresholdResult {
  lt1: LT1Result | null // null = niet bereikt binnen het testbereik
  lt2: Point // D-max — bepaald binnen het bereik
  obla: Point | null // null = 4,0 mmol/L niet bereikt
}
