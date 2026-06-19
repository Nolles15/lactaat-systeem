// Analyse: van meetpunten naar gefitte curve + drempels (LT1/LT2/OBLA) + R².
// Bouwt op de pure rekenkern; ruststap telt alleen als baseline, niet in de fit (ADR-0008).

import { polyFit, poly, dmax, findLT1, findOBLA } from './rekenkern'
import type { LT1Result, Point } from './types'

export interface Drempels {
  lt1: LT1Result | null
  lt2: Point | null
  obla: Point | null
}

export interface Analyse {
  meetpunten: Point[] // incl. rust (x=0) indien aanwezig — voor de scatter
  coef: number[] | null
  graad: number | null
  r2: number | null
  curve: Point[] // gesamplede fitcurve over het stappenbereik
  drempels: Drempels
  waarschuwingen: string[]
}

export interface AnalyseInput {
  rust: number | null
  stappen: Point[] // {x: intensiteit (W of km/h), y: lactaat}
}

/** Polynoomgraad: graad 4 vanaf 6 punten, anders 3; lager bij te weinig punten (briefing 10). */
export function kiesGraad(n: number): number | null {
  if (n >= 6) return 4
  if (n >= 4) return 3
  if (n >= 3) return 2
  return null
}

function bepaalR2(xs: number[], ys: number[], coef: number[]): number {
  const gem = ys.reduce((s, y) => s + y, 0) / ys.length
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < xs.length; i++) {
    ssRes += (ys[i] - poly(coef, xs[i])) ** 2
    ssTot += (ys[i] - gem) ** 2
  }
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot
}

export function analyseer({ rust, stappen }: AnalyseInput): Analyse {
  const gesorteerd = [...stappen].sort((a, b) => a.x - b.x)
  const meetpunten = rust !== null ? [{ x: 0, y: rust }, ...gesorteerd] : [...gesorteerd]
  const waarschuwingen: string[] = []

  const xs = gesorteerd.map((p) => p.x)
  const ys = gesorteerd.map((p) => p.y)
  const graad = kiesGraad(gesorteerd.length)
  const coef = graad !== null ? polyFit(xs, ys, graad) : null

  if (coef === null) {
    waarschuwingen.push('Te weinig meetpunten voor een betrouwbare curve.')
    return {
      meetpunten,
      coef: null,
      graad,
      r2: null,
      curve: [],
      drempels: { lt1: null, lt2: null, obla: null },
      waarschuwingen,
    }
  }

  const x0 = xs[0]
  const x1 = xs[xs.length - 1]
  const r2 = bepaalR2(xs, ys, coef)

  // Curve samplen voor de grafiek.
  const N = 100
  const curve: Point[] = []
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    curve.push({ x, y: poly(coef, x) })
  }

  // LT1-baseline incl. rust (ADR-0008): laagste van rust + eerste stapwaarden.
  const baselineYs = rust !== null ? [rust, ...ys] : ys
  const drempels: Drempels = {
    lt1: findLT1(coef, baselineYs, x0, x1),
    lt2: dmax(coef, x0, x1),
    obla: findOBLA(coef, x0, x1),
  }

  // Fail-visible randen (ADR-0002).
  if (r2 < 0.95) waarschuwingen.push(`Lage R² (${r2.toFixed(3)}) — beoordeel de curve kritisch.`)
  if (curve.some((p) => p.y < 0 || p.y > 15))
    waarschuwingen.push('De curve valt deels buiten het verwachte bereik (lactaat < 0 of > 15).')
  if (drempels.obla === null)
    waarschuwingen.push('OBLA (4,0 mmol/L) wordt niet bereikt binnen het testbereik.')

  return { meetpunten, coef, graad, r2, curve, drempels, waarschuwingen }
}
