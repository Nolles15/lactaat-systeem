// Rapport-teksten: gestandaardiseerde Nederlandse zinnen, deterministisch uit het rapport-model
// gevuld via vaste sjablonen met {placeholders}. BEWUST GEEN AI in het systeem (eis): de sjablonen
// zijn vaste tekst die het lab zelf beheert; deze laag vult er alleen data in.
//
// Toon: feitelijk, fysiologisch — performance-analyse, GEEN trainingsadvies (eigenaar-besluit).
// Defensief + fail-visible: bij ontbrekende of onbetrouwbare data geen stellige zin (null/neutraal).

import { formatIntensiteit } from './invoer'
import type { RapportModel } from './rapportmodel'
import type { SportType } from './types'

/**
 * Drempel-bpm waaronder we de lactaat- en ademgasdrempels "bevestigen elkaar" noemen. Fysiologisch
 * is een afwijking tot ~8 bpm tussen LT en VT klein. Heuristiek — door het lab te ijken; bewust
 * één plek (geen schijnprecisie verstopt in de tekst).
 */
export const CONSISTENT_DREMPEL_BPM = 8

const heel = (n: number): string => String(Math.round(n))
const een = (n: number): string => n.toFixed(1).replace('.', ',')
const drie = (n: number): string => n.toFixed(3).replace('.', ',')

/** Vul {sleutel}-placeholders in een sjabloon. Deterministisch; ontbrekende sleutel blijft zichtbaar. */
export function vul(sjabloon: string, data: Record<string, string>): string {
  return sjabloon.replace(/\{(\w+)\}/g, (_, k: string) => (k in data ? data[k] : `{${k}}`))
}

/** Vaste zins-sjablonen — dit is de "pen" van het lab. Pas hier de bewoording aan, niet de logica. */
export const SJABLONEN = {
  samenvattingLactaat:
    'Je anaerobe drempel ligt bij {lt2}. Daarboven stapelt je verzuring zich sneller op dan je lichaam die afvoert.',
  lt1:
    'Tot {lt1} blijven de aanmaak en afvoer van lactaat ruim in balans — dit is je aerobe drempel.',
  lt2:
    '{lt2} is het berekende kantelpunt van je lactaatcurve: het punt dat uit de vorm van je eigen curve volgt, niet uit een vaste standaardwaarde. Boven dit punt loopt het lactaat versneld op.',
  obla: 'Bij {obla} bereikt je lactaat {niveau} mmol/L.',
  curve:
    'Je lactaatcurve blijft tot ongeveer {knik} laag en vlak, en loopt daarboven steeds steiler op.',
  betrouwbaarHoog: 'De curve sluit nauw aan op je meetpunten (R² = {r2} van maximaal 1,000).',
  betrouwbaarLaag:
    'Let op: de curve sluit minder strak aan op je meetpunten (R² = {r2}). Beoordeel de drempels met enige voorzichtigheid.',
  vo2max: 'Je VO₂max is {mlkg} ml/kg/min ({lmin} L/min).',
  voorspeld:
    'Dat is {pct}% van de verwachte waarde voor iemand van jouw leeftijd, geslacht en gewicht (referentiewaarde uit de meetapparatuur).',
  combiBevestigt:
    'De lactaat- en de ademgasmeting bevestigen elkaar: de aerobe drempels liggen {d1} bpm uit elkaar, de anaerobe {d2} bpm.',
  combiUiteen:
    'De lactaat- en de ademgasdrempels liggen verder uit elkaar (aeroob {d1} bpm, anaeroob {d2} bpm). Dat kan komen door een verschil in meetmethode of door natuurlijke variatie tussen beide systemen.',
} as const

/** Korte drempel-aanduiding voor in een zin: intensiteit + hartslag, zonder W/kg-ruis. */
function drempelLabel(sport: SportType, intensiteit: number, hr: number | null): string {
  const i = formatIntensiteit(sport, intensiteit, null)
  return hr !== null ? `${i} (${heel(hr)} bpm)` : i
}

function vindDrempel(model: RapportModel, code: 'LT1' | 'LT2' | 'OBLA') {
  return model.lactaat?.drempels.find((d) => d.code === code) ?? null
}

/** Single-answer-first kopzin. null als er geen anaerobe drempel is. */
export function samenvattingZin(model: RapportModel): string | null {
  const lt2 = vindDrempel(model, 'LT2')
  if (!lt2) return null
  return vul(SJABLONEN.samenvattingLactaat, { lt2: drempelLabel(model.test.sport, lt2.intensiteit, lt2.hr) })
}

/** Neutrale fysiologische duiding per drempel ("Wat dit betekent"). null als de drempel ontbreekt. */
export function drempelBetekenis(model: RapportModel, code: 'LT1' | 'LT2' | 'OBLA'): string | null {
  const d = vindDrempel(model, code)
  if (!d) return null
  const label = drempelLabel(model.test.sport, d.intensiteit, d.hr)
  if (code === 'LT1') return vul(SJABLONEN.lt1, { lt1: label })
  if (code === 'LT2') return vul(SJABLONEN.lt2, { lt2: label })
  return vul(SJABLONEN.obla, { obla: label, niveau: een(d.lactaat) })
}

/** Beschrijving van de curve-vorm; knikpunt = LT1 indien bekend, anders LT2. null zonder beide. */
export function curveBeschrijving(model: RapportModel): string | null {
  const knik = vindDrempel(model, 'LT1') ?? vindDrempel(model, 'LT2')
  if (!knik) return null
  return vul(SJABLONEN.curve, { knik: formatIntensiteit(model.test.sport, knik.intensiteit, null) })
}

/** Betrouwbaarheidszin op basis van R² (fail-visible bij lage R²). null als R² ontbreekt. */
export function betrouwbaarheidZin(model: RapportModel): string | null {
  const r2 = model.lactaat?.r2
  if (r2 == null) return null
  const sjabloon = model.lactaat!.betrouwbaar ? SJABLONEN.betrouwbaarHoog : SJABLONEN.betrouwbaarLaag
  return vul(sjabloon, { r2: drie(r2) })
}

/** VO₂max-zin (+ optioneel de %-voorspeld-uitleg). null zonder VO₂max-waarde. */
export function vo2maxZin(model: RapportModel): string | null {
  const v = model.vo2max?.vo2max
  if (!v || v.mlPerKgMin == null || v.lPerMin == null) return null
  let zin = vul(SJABLONEN.vo2max, { mlkg: heel(v.mlPerKgMin), lmin: een(v.lPerMin) })
  if (v.pctVoorspeld != null) zin += ' ' + vul(SJABLONEN.voorspeld, { pct: heel(v.pctVoorspeld) })
  return zin
}

/** Of de lactaat- en ademgasdrempels binnen de drempel-bpm samenvallen. null als niet te bepalen. */
export function drempelsConsistent(model: RapportModel): boolean | null {
  const c = model.combinatie
  if (!c || c.aeroob.deltaHr == null || c.anaeroob.deltaHr == null) return null
  return c.aeroob.deltaHr <= CONSISTENT_DREMPEL_BPM && c.anaeroob.deltaHr <= CONSISTENT_DREMPEL_BPM
}

/** Neutrale duiding van lactaat↔ademgas: bevestigen elkaar óf lopen uiteen. null zonder combi. */
export function combinatieDuiding(model: RapportModel): string | null {
  const c = model.combinatie
  const consistent = drempelsConsistent(model)
  if (!c || consistent == null) return null
  const data = { d1: heel(c.aeroob.deltaHr as number), d2: heel(c.anaeroob.deltaHr as number) }
  return vul(consistent ? SJABLONEN.combiBevestigt : SJABLONEN.combiUiteen, data)
}

/** Neutrale, fysiologische omschrijving per trainingszone (geen advies). */
export const ZONE_BETEKENIS: Record<string, string> = {
  // 3-zone (drempelzones)
  '1': 'Onder je aerobe drempel: grotendeels aeroob, lactaat blijft laag.',
  '2': 'Tussen je aerobe en anaerobe drempel: de inspanning loopt op, lactaat stijgt geleidelijk.',
  '3': 'Boven je anaerobe drempel: lactaat stapelt sneller op dan je lichaam afvoert.',
  // 5-zone
  A1: 'Herstel: zeer lage intensiteit, ruim onder de aerobe drempel.',
  A2: 'Aerobe basis: duurinspanning met grotendeels vetverbranding.',
  'A2+': 'Extensieve drempel: tegen de aerobe drempel aan.',
  B: 'Intensieve drempel: tussen de aerobe en anaerobe drempel.',
  C: 'Boven de anaerobe drempel: hoge intensiteit, snel oplopend lactaat.',
}
