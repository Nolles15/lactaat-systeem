# ADR-0017: VO2max-module + Cortex-import (beautify)

- **Status**: Geaccepteerd
- **Datum**: 2026-06-20
- **Bouwt voort op**: ADR-0014, ADR-0001

## Context

Deel B (plan v3): de app moet ook VO2max aankunnen — óf lactaat, óf VO2max, óf beide. Aanpak:
**beautify** — we vertrouwen de door de metabole kar berekende getallen en tonen ze mooi (geen eigen
VO2-analyse-engine). De voorbeeldbestanden zijn **Cortex MetaSoft**-exports (SpreadsheetML).

## Beslissing

- Nieuwe **`modules.vo2max`** in de `Sessie` (ADR-0014): een **beautified samenvatting** —
  VO2max/peak (L/min + ml/kg/min, % voorspeld, HR-piek), VT1 en VT2 (VO2 + HR), VE/VCO₂ (bij VT2 en
  piek), en de bron (apparaat + bestandsnaam). Géén ruwe breath-by-breath stroom in de sessie
  (klein/store-ready). `SESSIE_VERSIE` → 2; `opslag.ts` laadt v1 én v2 (v1 mist simpelweg vo2max).
- **Cortex-parser** (`src/lib/cortex.ts`): leest de SpreadsheetML, mapt de Head (naam, geslacht,
  geboortedatum, gewicht) en de **Summary-matrix** (rijen V'O2 / V'O2/kg / HR / V'E/V'CO2 ×
  kolommen VT1 / VT2 / V'O2peak / % Norm) naar de module. Pure parse-logica, los getest met een
  synthetische fixture; het bestand-lezen gebeurt client-side in de UI (`DOMParser`/FileReader —
  geen upload, ADR-0001).
- **Adapter-patroon**: Cortex is de eerste adapter; andere apparaten krijgen later een eigen adapter
  die naar dezelfde module normaliseert.
- De parser verwerkt persoonsgegevens (naam/geboortedatum) **in-sessie**; ze verlaten de sessie
  alleen via export (ADR-0001). De ruwe exportbestanden horen **niet** in git (zie `.gitignore`).

## Gevolgen

**Positief:** "óf VO2max" werkt op echte data, zonder fysiologie-engine; combinatie met lactaat ligt
open via het modulaire model. **Negatief / kosten:** afhankelijk van het Cortex-format (rij/kolom-
labels); andere karren vergen een nieuwe adapter. VE/VCO₂-**slope** zit niet als zodanig in deze
export (wel de ratio) → die tonen we, slope blijft open.

## Toekomstgevolgen

- **Legt vast**: beautify + module-shape + adapter-architectuur.
- **Houdt open**: extra adapters, een uitgedunde curve voor een plot, en het (combinatie)rapport
  (Deel B.3). **Trigger**: nieuw apparaat, of de rapport-ronde.
