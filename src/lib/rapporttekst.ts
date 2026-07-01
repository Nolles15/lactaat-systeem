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
    'Je anaerobe drempel ligt bij {lt2}. Daarboven stapelt je lactaat zich sneller op dan je lichaam het afvoert.',
  samenvattingVo2max:
    'Je VO₂max is {mlkg} ml/kg/min — een maat voor hoeveel zuurstof je lichaam maximaal kan verwerken, en daarmee voor je aerobe uithoudingsvermogen.',
  lt1:
    'Tot {lt1} blijven de aanmaak en de afvoer van lactaat ruim in balans: je lichaam ruimt het net zo snel op als het ontstaat, dus dit tempo kun je heel lang volhouden. Dit is je aerobe drempel — de bovengrens van je rustige duurinspanning.',
  lt2:
    '{lt2} is het berekende kantelpunt van je lactaatcurve: het punt dat uit de vorm van je eigen curve volgt, niet uit een vaste standaardwaarde. Vanaf hier maakt je lichaam meer lactaat aan dan het kan afvoeren, dus het stapelt zich op — dit tempo houd je maar kort vol.',
  obla:
    'Bij {obla} bereikt je lactaat de vaste referentiewaarde van {niveau} mmol/L (OBLA). Dit is geen persoonlijke drempel, maar een vast ijkpunt waarmee labs testen en sporters onderling vergelijken.',
  curve:
    'Bij elke stap zwaarder maakt je lichaam meer lactaat aan. Je lactaatcurve blijft tot ongeveer {knik} laag en vlak — je ruimt het lactaat nog moeiteloos op — en loopt daarboven steeds steiler op.',
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
  // Ademgas-reis (mijlpaal-vorm, ADR-0027): alleen écht gemeten waarden — geen verzonnen curve.
  ademgasVo2max:
    'Je lichaam verwerkt maximaal {mlkg} ml zuurstof per kilo per minuut ({lmin} L/min). Dit getal — je VO₂max — weerspiegelt je aerobe vermogen: hoeveel energie je met zuurstof kunt leveren.',
  ademgasVoorspeld:
    'Dat is {pct}% van de verwachte waarde voor iemand van jouw leeftijd, geslacht en gewicht.',
  ademgasVt1:
    'Rond {vt1} wordt je ademhaling merkbaar sneller: je eerste ventilatoire drempel (VT1). Tot hier is de inspanning goed vol te houden. VT1 hoort bij je eerste (aerobe) drempel.',
  ademgasVt2:
    'Rond {vt2} versnelt je ademhaling sterk: je tweede ventilatoire drempel (VT2). Daarboven loopt de belasting hoog op en houd je het maar kort vol. VT2 hoort bij je tweede (anaerobe) drempel.',
  ademgasPiek:
    'Bij maximale inspanning bereikte je een hartslagpiek van {piek} bpm — de top van je inspanning in deze test.',
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

/** Kopzin wanneer ademgas de primaire test is (VO₂max als kerngetal). null zonder VO₂max-waarde. */
export function samenvattingVo2maxZin(model: RapportModel): string | null {
  const v = model.vo2max?.vo2max
  if (!v || v.mlPerKgMin == null) return null
  return vul(SJABLONEN.samenvattingVo2max, { mlkg: heel(v.mlPerKgMin) })
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

/**
 * Stappen voor de ademgas-reis (mijlpaal-vorm, ADR-0027). Elke stap = één écht gemeten mijlpaal
 * (VO₂max → VT1 → VT2 → piek). Defensief: een stap verschijnt alleen als zijn data er is; geen
 * verzonnen curve of getal. Leeg als er geen ademgasmodule is.
 */
export function ademgasReisStappen(model: RapportModel): { kop: string; tekst: string }[] {
  const v = model.vo2max
  if (!v) return []
  const stappen: { kop: string; tekst: string }[] = []
  const vm = v.vo2max
  if (vm.mlPerKgMin != null && vm.lPerMin != null) {
    let tekst = vul(SJABLONEN.ademgasVo2max, { mlkg: heel(vm.mlPerKgMin), lmin: een(vm.lPerMin) })
    if (vm.pctVoorspeld != null) tekst += ' ' + vul(SJABLONEN.ademgasVoorspeld, { pct: heel(vm.pctVoorspeld) })
    stappen.push({ kop: 'Je zuurstofopname', tekst })
  }
  if (v.vt1.hr != null)
    stappen.push({ kop: 'Je eerste ademomslag', tekst: vul(SJABLONEN.ademgasVt1, { vt1: `${heel(v.vt1.hr)} bpm` }) })
  if (v.vt2.hr != null)
    stappen.push({ kop: 'Je tweede ademomslag', tekst: vul(SJABLONEN.ademgasVt2, { vt2: `${heel(v.vt2.hr)} bpm` }) })
  if (vm.hrPiek != null)
    stappen.push({ kop: 'Je piek', tekst: vul(SJABLONEN.ademgasPiek, { piek: heel(vm.hrPiek) }) })
  return stappen
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
  A2: 'Aerobe basis: rustige duurinspanning met een grote bijdrage van vetverbranding.',
  'A2+': 'Net tot tegen je aerobe drempel aan: nog goed vol te houden, lactaat blijft laag.',
  B: 'Tussen je aerobe en anaerobe drempel: stevige inspanning, lactaat stijgt geleidelijk.',
  C: 'Boven de anaerobe drempel: hoge intensiteit, snel oplopend lactaat.',
}

/**
 * Woordenlijst voor de aanklikbare jargon-uitleg in het rapport. Korte, formele leken-definities
 * (geen "ModDmax"). Eén plek; het lab beheert de bewoording. De sleutel is de getoonde term.
 */
export const WOORDENLIJST: Record<string, string> = {
  'Aerobe drempel':
    'Het eerste omslagpunt. Tot hier blijven aanmaak en afvoer van lactaat in balans en kun je het tempo heel lang volhouden. In de lactaatmeting heet dit LT1; in de ademgasmeting het verwante punt VT1.',
  'Anaerobe drempel':
    'Het tweede omslagpunt, het "kantelpunt" van je curve. Daarboven loopt het lactaat sneller op dan je het afvoert en houd je het tempo maar kort vol. In de lactaatmeting LT2; in de ademgasmeting het verwante punt VT2. ("Anaeroob" is een ingeburgerde bijnaam; je stofwisseling is daarboven niet ineens zuurstofloos.)',
  OBLA: 'Het punt waarop je lactaat de vaste referentiewaarde van 4 mmol/L bereikt. Geen persoonlijke drempel, maar een vast ijkpunt om testen en sporters te vergelijken.',
  'VO₂max':
    'De maximale hoeveelheid zuurstof die je lichaam per minuut kan verwerken (ml/kg/min). Een maat voor je aerobe uithoudingsvermogen.',
  VT1: 'Eerste ventilatoire drempel: dezelfde eerste overgang, maar gevonden via je ademhaling in plaats van via bloed. VT1 ≈ je eerste (aerobe) drempel.',
  VT2: 'Tweede ventilatoire drempel: dezelfde tweede overgang, gevonden via je ademhaling in plaats van via bloed. VT2 ≈ je tweede (anaerobe) drempel.',
  'VE/VCO₂': 'Hoeveel lucht je verademt per liter uitgestoten koolstofdioxide. Een stijging hiervan helpt de ventilatoire drempels te bepalen.',
  'R²': 'Een rapportcijfer voor hoe goed de berekende curve op je meetpunten past, van 0 tot 1,000. Hoe dichter bij 1,000, hoe betrouwbaarder de afgeleide drempels.',
}
