// Analyse: van meetpunten naar gefitte curve + drempels (LT1/LT2/OBLA) + R².
// Instelbaar (ADR-0011): LT2-methode (Dmax/Modified-Dmax), OBLA-niveau, LT1-delta, graad.
// Ruststap telt alleen als baseline, niet in de fit (ADR-0008).

import { polyFit, poly, dmax, findLT1, findOBLA } from './rekenkern'
import type { LT1Result, Point } from './types'

export type LT2Methode = 'dmax' | 'moddmax'

export interface AnalyseConfig {
  lt2Methode: LT2Methode
  oblaNiveau: number // mmol/L (2/3/4)
  lt1Delta: number // baseline + delta (0,5/1,0/1,5)
  graad: 'auto' | number // 'auto' = R²/AIC-advies
}

export const STANDAARD_CONFIG: AnalyseConfig = {
  lt2Methode: 'moddmax',
  oblaNiveau: 4,
  lt1Delta: 1.0,
  graad: 'auto',
}

export interface Drempels {
  lt1: LT1Result | null
  lt2: Point | null
  obla: Point | null
}

export interface Analyse {
  meetpunten: Point[] // incl. rust (x=0) indien aanwezig — meetellende punten voor de scatter
  uitgeslotenPunten: Point[] // wel getoond, niet in de fit (ADR-0011)
  coef: number[] | null
  graad: number | null
  graadAdvies: number | null // R²/AIC-aanbeveling
  r2: number | null
  curve: Point[] // gesamplede fitcurve over het stappenbereik
  drempels: Drempels
  lt2Methode: LT2Methode
  lt2Lijn: { start: Point; eind: Point } | null // de gebruikte (Mod)Dmax-lijn
  hr: { lt1: number | null; lt2: number | null; obla: number | null } // HR bij de drempels (bpm)
  waarschuwingen: string[]
}

export interface StapInput {
  x: number // intensiteit (W of km/u)
  y: number // lactaat (mmol/L)
  hf?: number | null // hartslag (bpm), optioneel
  uitgesloten?: boolean // true = wel tonen, niet meefitten
}

export interface AnalyseInput {
  rust: number | null
  stappen: StapInput[] // alleen meetellende stappen
  config: AnalyseConfig
}

/** Polynoomgraad-ondergrens op basis van het aantal punten (briefing 10). */
export function kiesGraad(n: number): number | null {
  if (n >= 6) return 4
  if (n >= 4) return 3
  if (n >= 3) return 2
  return null
}

function ssRes(xs: number[], ys: number[], coef: number[]): number {
  let s = 0
  for (let i = 0; i < xs.length; i++) s += (ys[i] - poly(coef, xs[i])) ** 2
  return s
}

function bepaalR2(xs: number[], ys: number[], coef: number[]): number {
  const gem = ys.reduce((s, y) => s + y, 0) / ys.length
  let ssTot = 0
  for (const y of ys) ssTot += (y - gem) ** 2
  return ssTot === 0 ? 1 : 1 - ssRes(xs, ys, coef) / ssTot
}

/** Graadadvies via AIC over de haalbare graden (2..4): lagere AIC = beter. */
export function kiesGraadAIC(xs: number[], ys: number[]): number | null {
  const n = xs.length
  let beste: number | null = null
  let besteAic = Infinity
  for (let d = 2; d <= 4; d++) {
    if (n < d + 1) break
    const coef = polyFit(xs, ys, d)
    if (!coef) continue
    const rss = Math.max(ssRes(xs, ys, coef), 1e-12)
    const aic = n * Math.log(rss / n) + 2 * (d + 1)
    if (aic < besteAic) {
      besteAic = aic
      beste = d
    }
  }
  return beste
}

/** Lineaire interpolatie van v op positie x; null buiten het bereik of < 2 punten. */
export function interpoleerOpX(punten: { x: number; v: number }[], x: number): number | null {
  if (punten.length < 2) return null
  const p = [...punten].sort((a, b) => a.x - b.x)
  if (x < p[0].x || x > p[p.length - 1].x) return null
  for (let i = 1; i < p.length; i++) {
    if (x <= p[i].x) {
      const t = (x - p[i - 1].x) / (p[i].x - p[i - 1].x)
      return p[i - 1].v + t * (p[i].v - p[i - 1].v)
    }
  }
  return p[p.length - 1].v
}

/** x van het meetpunt vlak vóór de eerste duidelijke lactaatstijging (>drempel t.o.v. vorige). */
function eersteStijgingX(xs: number[], ys: number[], drempel = 0.4): number {
  for (let i = 1; i < ys.length; i++) {
    if (ys[i] - ys[i - 1] > drempel) return xs[i - 1]
  }
  return xs[0]
}

export function analyseer({ rust, stappen, config }: AnalyseInput): Analyse {
  const gesorteerd = stappen.filter((s) => s.uitgesloten !== true).sort((a, b) => a.x - b.x)
  const uitgeslotenPunten = stappen
    .filter((s) => s.uitgesloten === true)
    .map((s) => ({ x: s.x, y: s.y }))
    .sort((a, b) => a.x - b.x)
  const meetpunten = rust !== null ? [{ x: 0, y: rust }, ...gesorteerd] : [...gesorteerd]
  const waarschuwingen: string[] = []
  const xs = gesorteerd.map((p) => p.x)
  const ys = gesorteerd.map((p) => p.y)
  const n = gesorteerd.length

  const graadAdvies = kiesGraadAIC(xs, ys)
  let graad: number | null
  if (config.graad === 'auto') graad = graadAdvies ?? kiesGraad(n)
  else graad = Math.min(config.graad, n - 1)
  if (graad !== null && graad < 2) graad = kiesGraad(n)

  const coef = graad !== null ? polyFit(xs, ys, graad) : null
  if (coef === null) {
    waarschuwingen.push('Te weinig meetpunten voor een betrouwbare curve.')
    return {
      meetpunten,
      uitgeslotenPunten,
      coef: null,
      graad,
      graadAdvies,
      r2: null,
      curve: [],
      drempels: { lt1: null, lt2: null, obla: null },
      lt2Methode: config.lt2Methode,
      lt2Lijn: null,
      hr: { lt1: null, lt2: null, obla: null },
      waarschuwingen,
    }
  }

  const x0 = xs[0]
  const x1 = xs[xs.length - 1]
  const r2 = bepaalR2(xs, ys, coef)

  const N = 100
  const curve: Point[] = []
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    curve.push({ x, y: poly(coef, x) })
  }

  // LT2 via (Modified-)Dmax: ModDmax start bij de eerste duidelijke stijging.
  const lt2Start = config.lt2Methode === 'moddmax' ? eersteStijgingX(xs, ys) : x0
  const lt2 = dmax(coef, lt2Start, x1)
  const lt2Lijn = {
    start: { x: lt2Start, y: poly(coef, lt2Start) },
    eind: { x: x1, y: poly(coef, x1) },
  }

  // LT1-baseline incl. rust (ADR-0008); delta instelbaar.
  const baselineYs = rust !== null ? [rust, ...ys] : ys
  const drempels: Drempels = {
    lt1: findLT1(coef, baselineYs, x0, x1, config.lt1Delta),
    lt2,
    obla: findOBLA(coef, x0, x1, config.oblaNiveau),
  }

  // Hartslag bij de drempels: interpoleer over de stappen met een HF-waarde (ADR-0011).
  const hfPunten = gesorteerd.filter((s) => s.hf != null).map((s) => ({ x: s.x, v: s.hf as number }))
  const hr = {
    lt1: drempels.lt1 ? interpoleerOpX(hfPunten, drempels.lt1.x) : null,
    lt2: drempels.lt2 ? interpoleerOpX(hfPunten, drempels.lt2.x) : null,
    obla: drempels.obla ? interpoleerOpX(hfPunten, drempels.obla.x) : null,
  }

  // Fail-visible randen (ADR-0002).
  if (r2 < 0.95) waarschuwingen.push(`Lage R² (${r2.toFixed(3)}) — beoordeel de curve kritisch.`)
  if (curve.some((p) => p.y < 0 || p.y > 15))
    waarschuwingen.push('De curve valt deels buiten het verwachte bereik (lactaat < 0 of > 15).')
  if (drempels.obla === null)
    waarschuwingen.push(
      `OBLA (${config.oblaNiveau.toString().replace('.', ',')} mmol/L) wordt niet bereikt binnen het testbereik.`,
    )

  return {
    meetpunten,
    uitgeslotenPunten,
    coef,
    graad,
    graadAdvies,
    r2,
    curve,
    drempels,
    lt2Methode: config.lt2Methode,
    lt2Lijn,
    hr,
    waarschuwingen,
  }
}
