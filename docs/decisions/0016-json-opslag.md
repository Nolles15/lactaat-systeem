# ADR-0016: JSON opslaan/inladen — versioned, bestand-gebaseerd

- **Status**: Geaccepteerd
- **Datum**: 2026-06-20
- **Bouwt voort op**: ADR-0001, ADR-0012, ADR-0014

## Context

De eigenaar koos voor bestand-gebaseerde, store-ready opslag (geen server, AVG-licht). Dankzij het
modulaire `Sessie`-model (ADR-0014) kan dit nu netjes: een sessie wordt geserialiseerd naar JSON,
gedownload door de testleider en later weer ingeladen. Dit vervangt de eerder geparkeerde
JSON-beslissing.

## Beslissing

- **Exporteren**: de hele `Sessie` → **versioned JSON** (`versie`-veld), client-side gedownload.
  **Naam verplicht** vóór export (ADR-0012); zonder naam is de knop uit.
- **Inladen**: een JSON-bestand wordt gelezen (FileReader), gevalideerd (geldige JSON +
  `versie` + basisstructuur) en in de sessie geladen. Onbekende versie → nette foutmelding.
- **Geen server** (ADR-0001): alleen de browser + het bestand. De beheerde Hanze-schijf blijft
  system of record.
- Pure logica (`src/lib/opslag.ts`: `sessieNaarJson` / `jsonNaarSessie` / `bestandsnaam`) los
  getest; de download/bestand-lees-acties leven in de UI.

## Gevolgen

**Positief:** sessies overleven het sluiten van de tab; basis voor test-vergelijking later; past op
de privacy-concessie. **Negatief / kosten:** de testleider beheert bestanden zelf; bij een latere
`versie`-bump is migratie nodig (vandaar het versie-veld).

## Toekomstgevolgen

- **Legt vast**: versioned JSON als uitwissel-/opslagformaat van een sessie.
- **Houdt open**: test-vergelijking (twee bestanden), migratie bij schema-evolutie, en — als ooit
  gewenst — een centrale store (het formaat is store-ready). **Trigger**: vergelijk-feature of
  schemawijziging.
