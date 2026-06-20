// Trainingszones afgeleid van LT1 en LT2 (ADR-0009). Pure functies, los testbaar.
// Eén plek om het zone-recept aan te passen als de lab-methodiek verandert.

import { interpoleerOpX } from './analyse'

export interface Zone {
  code: string
  naam: string
  /** Ondergrens intensiteit (W of km/h); null = open naar beneden. */
  min: number | null
  /** Bovengrens intensiteit; null = open naar boven. */
  max: number | null
}

/** Drie zones rechtstreeks op de drempels: < LT1, LT1–LT2, > LT2. */
export function drempelzones(lt1: number, lt2: number): Zone[] {
  return [
    { code: '1', naam: 'Herstel / aeroob', min: null, max: lt1 },
    { code: '2', naam: 'Tussen drempels', min: lt1, max: lt2 },
    { code: '3', naam: 'Boven drempel', min: lt2, max: null },
  ]
}

/** Vijf trainingszones (briefing 3.5): LT1−10% en het middelpunt tussen LT1 en LT2. */
export function trainingszones(lt1: number, lt2: number): Zone[] {
  const mid = (lt1 + lt2) / 2
  return [
    { code: 'A1', naam: 'Herstel / actieve regeneratie', min: null, max: lt1 * 0.9 },
    { code: 'A2', naam: 'Aerobe basisduur', min: lt1 * 0.9, max: lt1 },
    { code: 'A2+', naam: 'Extensieve drempel', min: lt1, max: mid },
    { code: 'B', naam: 'Intensieve drempel', min: mid, max: lt2 },
    { code: 'C', naam: 'VO2max / Interval', min: lt2, max: null },
  ]
}

export interface ZoneHr {
  min: number | null
  max: number | null
}

/** HR op de zonegrenzen, geïnterpoleerd over de HF-meetpunten (ADR-0015). null = buiten bereik. */
export function zoneHr(hfPunten: { x: number; v: number }[], z: Zone): ZoneHr {
  return {
    min: z.min !== null ? interpoleerOpX(hfPunten, z.min) : null,
    max: z.max !== null ? interpoleerOpX(hfPunten, z.max) : null,
  }
}
