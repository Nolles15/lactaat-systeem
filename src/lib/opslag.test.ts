import { describe, it, expect } from 'vitest'
import { sessieNaarJson, jsonNaarSessie, bestandsnaam } from './opslag'
import { legeSessie } from './sessie'

describe('opslag round-trip', () => {
  it('sessie → json → sessie blijft gelijk', () => {
    const s = legeSessie('2026-06-20')
    s.deelnemer.naam = 'Pietje'
    s.modules.lactaat!.rust = '1,2'
    const res = jsonNaarSessie(sessieNaarJson(s))
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.sessie).toEqual(s)
  })

  it('ongeldige JSON → fout', () => {
    expect(jsonNaarSessie('niet json').ok).toBe(false)
  })

  it('ontbrekende versie → fout', () => {
    expect(jsonNaarSessie('{"deelnemer":{},"test":{},"modules":{}}').ok).toBe(false)
  })

  it('onbekende versie → fout', () => {
    expect(jsonNaarSessie('{"versie":99,"deelnemer":{},"test":{},"modules":{}}').ok).toBe(false)
  })

  it('laadt een v1-bestand (zonder vo2max) lenient', () => {
    expect(jsonNaarSessie('{"versie":1,"deelnemer":{},"test":{},"modules":{}}').ok).toBe(true)
  })
})

describe('bestandsnaam', () => {
  it('bevat (geschoonde) naam en datum', () => {
    const s = legeSessie('2026-06-20')
    s.deelnemer.naam = 'Jan Jansen'
    expect(bestandsnaam(s)).toBe('lactaattest_Jan_Jansen_2026-06-20.json')
  })
})
