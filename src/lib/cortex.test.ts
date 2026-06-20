import { describe, it, expect } from 'vitest'
import { parseCortexXml, extractRows } from './cortex'

// Synthetische (anonieme) Cortex-achtige SpreadsheetML — geen echte persoonsgegevens.
const cel = (v: string) => `<Cell><Data ss:Type="String">${v}</Data></Cell>`
const row = (...vals: string[]) => `<Row>${vals.map(cel).join('')}</Row>`
const xml = `<?xml version="1.0"?><Workbook><Worksheet ss:Name="MetasoftStudio"><Table>
${row('First Name', 'Testy')}
${row('Last Name', 'McTest')}
${row('Sex', 'male')}
${row('Date of Birth', '6/28/2007')}
${row('Height', '186 cm')}
${row('Weight', '79.5 kg')}
${row('Variable', 'Unit', 'VT1', 'VT2', "V'O2peak", "V'O2peak % Norm")}
${row("V'O2", 'L/min', '2.40', '3.55', '4.29', '106')}
${row("V'O2/kg", 'ml/min/kg', '30', '45', '54', '101')}
${row('HR', '/min', '146', '166', '188', '103')}
${row("V'E/V'CO2", '', '22.3', '24.7', '28.3', '-')}
</Table></Worksheet></Workbook>`

describe('extractRows', () => {
  it('leest rijen met celwaarden', () => {
    const rows = extractRows(xml)
    expect(rows.some((r) => r[0] === 'First Name' && r[1] === 'Testy')).toBe(true)
  })
})

describe('parseCortexXml', () => {
  it('mapt head + summary naar deelnemer + vo2max', () => {
    const res = parseCortexXml(xml, 'test.xml')
    expect(res.ok).toBe(true)
    if (!res.ok) return

    expect(res.data.deelnemer.naam).toBe('Testy McTest')
    expect(res.data.deelnemer.geslacht).toBe('man')
    expect(res.data.deelnemer.geboortedatum).toBe('2007-06-28')
    expect(res.data.deelnemer.gewichtKg).toBe('79.5')

    const v = res.data.vo2max
    expect(v.vo2max.lPerMin).toBe(4.29)
    expect(v.vo2max.mlPerKgMin).toBe(54)
    expect(v.vo2max.pctVoorspeld).toBe(101)
    expect(v.vo2max.hrPiek).toBe(188)
    expect(v.vt1.vo2LPerMin).toBe(2.4)
    expect(v.vt1.hr).toBe(146)
    expect(v.vt2.vo2MlPerKgMin).toBe(45)
    expect(v.vt2.hr).toBe(166)
    expect(v.veVco2.vt2).toBe(24.7)
    expect(v.veVco2.piek).toBe(28.3)
    expect(v.bron.apparaat).toBe('Cortex MetaSoft')
  })

  it('weigert een niet-Cortex-bestand', () => {
    expect(parseCortexXml('<Workbook></Workbook>').ok).toBe(false)
  })
})
