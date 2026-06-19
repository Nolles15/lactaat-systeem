// Rekenkern van de lactaattest — faithful geport uit de bestaande tool (de oracle, ADR-0002).
// Pure functies, geen UI: zo blijven ze los testbaar en is de verificatie hard te maken.

import type { LT1Result, Point } from './types'

/**
 * Polynoomfit via normaalvergelijkingen + Gauss-eliminatie met partial pivoting.
 * Geeft de coëfficiënten [c0..c_deg] terug, of null bij te weinig punten of een
 * singuliere matrix.
 */
export function polyFit(xs: number[], ys: number[], deg: number): number[] | null {
  const n = xs.length,
    d = deg + 1
  if (n < d) return null
  const M: number[][] = Array.from({ length: d }, () => Array(d + 1).fill(0))
  for (let k = 0; k < n; k++) {
    const xp = Array.from({ length: 2 * d }, (_, j) => Math.pow(xs[k], j))
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) M[i][j] += xp[i + j]
      M[i][d] += xp[i] * ys[k]
    }
  }
  for (let col = 0; col < d; col++) {
    let maxRow = col
    for (let row = col + 1; row < d; row++)
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-12) return null
    for (let row = col + 1; row < d; row++) {
      const f = M[row][col] / M[col][col]
      for (let j = col; j <= d; j++) M[row][j] -= f * M[col][j]
    }
  }
  const c: number[] = Array(d).fill(0)
  for (let i = d - 1; i >= 0; i--) {
    c[i] = M[i][d] / M[i][i]
    for (let j = i - 1; j >= 0; j--) M[j][d] -= M[j][i] * c[i]
  }
  return c
}

/** Evalueer de polynoom met coëfficiënten c in punt x. */
export function poly(c: number[], x: number): number {
  return c.reduce((s, ci, i) => s + ci * Math.pow(x, i), 0)
}

/**
 * LT2 via D-max: het punt op de gefitte curve met de grootste *loodrechte* afstand
 * tot de rechte lijn tussen (x0, poly(x0)) en (x1, poly(x1)). Niet de verticale afstand.
 */
export function dmax(c: number[], x0: number, x1: number): Point {
  const y0 = poly(c, x0),
    y1 = poly(c, x1)
  const a = y1 - y0,
    b = x0 - x1,
    cc = -(a * x0 + b * y0)
  const len = Math.sqrt(a * a + b * b)
  let best = { dist: -Infinity, x: x0 }
  for (let i = 0; i <= 1000; i++) {
    const x = x0 + ((x1 - x0) * i) / 1000
    const dist = (a * x + b * poly(c, x) + cc) / len
    if (dist > best.dist) best = { dist, x }
  }
  return { x: best.x, y: poly(c, best.x) }
}

/**
 * LT1: eerste punt waar de gefitte curve 1,0 mmol/L boven de baseline uitkomt.
 * Baseline = laagste van de eerste (max 3) gemeten lactaatwaarden. null = niet bereikt.
 */
export function findLT1(
  c: number[],
  ys: number[],
  x0: number,
  xStop: number,
  delta = 1.0,
): LT1Result | null {
  const baseline = Math.min(...ys.slice(0, Math.min(3, ys.length)))
  const thr = baseline + delta
  for (let i = 0; i <= 1000; i++) {
    const x = x0 + ((xStop - x0) * i) / 1000
    if (poly(c, x) >= thr) return { x, y: poly(c, x), baseline, thr }
  }
  return null
}

/**
 * OBLA: eerste kruising van de gefitte curve met 4,0 mmol/L (lineair geïnterpoleerd
 * tussen de bemonsterde punten). null = niet bereikt binnen het testbereik.
 */
export function findOBLA(c: number[], x0: number, x1: number, niveau = 4): Point | null {
  let prev = poly(c, x0)
  for (let i = 1; i <= 1000; i++) {
    const x = x0 + ((x1 - x0) * i) / 1000
    const y = poly(c, x)
    if (prev < niveau && y >= niveau) {
      const t = (niveau - prev) / (y - prev)
      return { x: x0 + ((x1 - x0) * (i - 1 + t)) / 1000, y: niveau }
    }
    prev = y
  }
  return null
}

/** min/km (pace als "mm:ss") → km/h. Intern wordt altijd in km/h gerekend. */
export function paceToKmh(paceStr: string): number {
  const [min, sec] = paceStr.split(':').map(Number)
  const decMin = min + sec / 60
  return 60 / decMin
}

/**
 * km/h → min/km als "mm:ss".
 * NB: geport uit de oracle; deze rondt seconden af zonder overloop naar de volgende
 * minuut (kan in een randgeval "m:60" tonen). Gemarkeerd als oracle-edgecase voor
 * ADR-0002 — bewust niet stil aangepast.
 */
export function kmhToPace(kmh: number): string {
  const totalMin = 60 / kmh
  const min = Math.floor(totalMin)
  const sec = Math.round((totalMin - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}
