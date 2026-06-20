// Cortex MetaSoft CPET-export (SpreadsheetML / Excel-2003-XML) → vo2max-module (ADR-0017).
// Pure parse-logica (geen DOM nodig → los testbaar); het bestand-lezen gebeurt in de UI.
// Beautify: we nemen de door de kar berekende getallen over, we rekenen niets zelf.

import type { Geslacht } from './sessie'
import type { Vo2maxModule } from './sessie'

export interface CortexImport {
  deelnemer: { naam: string; geslacht: Geslacht; geboortedatum: string; gewichtKg: string }
  vo2max: Vo2maxModule
}

export type CortexResultaat = { ok: true; data: CortexImport } | { ok: false; fout: string }

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function decode(s: string): string {
  return s
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, e) => ENT[e])
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[’′`]/g, "'") // apostrof-varianten normaliseren (V'O2)
    .trim()
}

/** SpreadsheetML → rijen van celwaarden. Omgeving-onafhankelijk (regex op de regelmatige opmaak). */
export function extractRows(xml: string): string[][] {
  const rows: string[][] = []
  const rowRe = /<Row\b[^>]*>([\s\S]*?)<\/Row>/g
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(xml))) {
    const cells: string[] = []
    const cellRe = /<Data\b[^>]*>([\s\S]*?)<\/Data>/g
    let c: RegExpExecArray | null
    while ((c = cellRe.exec(m[1]))) cells.push(decode(c[1]))
    rows.push(cells)
  }
  return rows
}

function num(s: string | undefined): number | null {
  if (s == null) return null
  const t = s.trim().replace(',', '.')
  if (t === '' || t === '-') return null
  const v = Number(t)
  return Number.isFinite(v) ? v : null
}

function dobNaarIso(s: string): string {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/) // M/D/Y (Cortex)
  if (!m) return ''
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
}

function gewichtNaarKg(s: string): string {
  const m = s.trim().match(/^([\d.,]+)/) // "79.5 kg" → "79.5"
  return m ? m[1].replace(',', '.') : ''
}

export function parseCortexXml(xml: string, bestand = ''): CortexResultaat {
  const rows = extractRows(xml)
  if (rows.length === 0) return { ok: false, fout: 'Geen leesbare gegevens in het bestand.' }

  // Head: label → waarde (rijen met een naam- en een waardecel).
  const kv = new Map<string, string>()
  for (const r of rows) if (r.length >= 2 && r[0] && !kv.has(r[0])) kv.set(r[0], r[1])

  // Summary-matrix: header met o.a. VT1/VT2/V'O2peak.
  const hi = rows.findIndex((r) => r[0] === 'Variable' && r.includes("V'O2peak"))
  if (hi === -1) {
    return { ok: false, fout: 'Dit lijkt geen Cortex CPET-export (geen samenvatting gevonden).' }
  }
  const header = rows[hi]
  const col = (naam: string) => header.indexOf(naam)
  const cVT1 = col('VT1'),
    cVT2 = col('VT2'),
    cPeak = col("V'O2peak"),
    cPeakNorm = col("V'O2peak % Norm")
  const rij = (naam: string) => rows.slice(hi + 1).find((r) => r[0] === naam)
  const at = (r: string[] | undefined, c: number) => (r && c >= 0 ? num(r[c]) : null)

  const vO2 = rij("V'O2"),
    vO2kg = rij("V'O2/kg"),
    hr = rij('HR'),
    veco2 = rij("V'E/V'CO2")

  const vo2max: Vo2maxModule = {
    vo2max: {
      lPerMin: at(vO2, cPeak),
      mlPerKgMin: at(vO2kg, cPeak),
      pctVoorspeld: at(vO2kg, cPeakNorm),
      hrPiek: at(hr, cPeak),
    },
    vt1: { vo2LPerMin: at(vO2, cVT1), vo2MlPerKgMin: at(vO2kg, cVT1), hr: at(hr, cVT1) },
    vt2: { vo2LPerMin: at(vO2, cVT2), vo2MlPerKgMin: at(vO2kg, cVT2), hr: at(hr, cVT2) },
    veVco2: { vt2: at(veco2, cVT2), piek: at(veco2, cPeak) },
    bron: { apparaat: 'Cortex MetaSoft', bestand },
  }

  const naam = `${kv.get('First Name') ?? ''} ${kv.get('Last Name') ?? ''}`.trim()
  const sex = (kv.get('Sex') ?? '').toLowerCase()
  const geslacht: Geslacht = sex.startsWith('m') ? 'man' : sex.startsWith('f') || sex.startsWith('v') ? 'vrouw' : ''

  return {
    ok: true,
    data: {
      deelnemer: {
        naam,
        geslacht,
        geboortedatum: dobNaarIso(kv.get('Date of Birth') ?? ''),
        gewichtKg: gewichtNaarKg(kv.get('Weight') ?? ''),
      },
      vo2max,
    },
  }
}
