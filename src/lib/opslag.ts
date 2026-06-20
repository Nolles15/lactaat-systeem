// Opslaan/inladen van een sessie als versioned JSON (ADR-0016). Pure logica, los testbaar;
// de download/bestand-lees-acties zelf leven in de UI. Geen server (ADR-0001).

import { SESSIE_VERSIE, type Sessie } from './sessie'

export function sessieNaarJson(sessie: Sessie): string {
  return JSON.stringify(sessie, null, 2)
}

export type ImportResultaat = { ok: true; sessie: Sessie } | { ok: false; fout: string }

/** Parse + valideer een sessiebestand. Lenient genoeg voor onze eigen export, streng genoeg om
 *  rommel te weigeren. */
export function jsonNaarSessie(tekst: string): ImportResultaat {
  let data: unknown
  try {
    data = JSON.parse(tekst)
  } catch {
    return { ok: false, fout: 'Geen geldig JSON-bestand.' }
  }
  if (typeof data !== 'object' || data === null) {
    return { ok: false, fout: 'Geen geldig sessiebestand.' }
  }
  const d = data as Record<string, unknown>
  if (typeof d.versie !== 'number') {
    return { ok: false, fout: 'Geen geldig sessiebestand (versie ontbreekt).' }
  }
  if (d.versie < 1 || d.versie > SESSIE_VERSIE) {
    return { ok: false, fout: `Onbekende bestandsversie (${d.versie}).` }
  }
  if (!d.deelnemer || !d.test || !d.modules) {
    return { ok: false, fout: 'Geen geldig sessiebestand (structuur klopt niet).' }
  }
  return { ok: true, sessie: data as Sessie }
}

/** Bestandsnaam voor de download: lactaattest_<naam>_<datum>.json. */
export function bestandsnaam(sessie: Sessie): string {
  const naam = sessie.deelnemer.naam.trim().replace(/[^\w-]+/g, '_') || 'test'
  return `lactaattest_${naam}_${sessie.test.datum}.json`
}
