# ADR-0012: In-sessie datamodel + intake (privacy-concessie)

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0001

## Context

Voor een bruikbaar rapport zijn intake-gegevens nodig: in elk geval een **naam** (verplicht), en
optioneel testdatum, geboortedatum/geslacht, lichaamsgewicht (voor W/kg), testleider en notities.
Deze gegevens zijn persoonsgegevens. ADR-0001 legt vast dat de app niets bewaart; de concessie is
dat ze tijdens de test **wél worden ingevoerd**, maar de sessie alleen via een bewuste export
verlaten.

## Opties

- **A — In-sessie model in React-state.** Intake + meetdata leven alleen in het werkgeheugen;
  geen localStorage/server. Verlaat de sessie enkel via export (PDF/JSON, later).
- **B — Lokale opslag (localStorage).** Gemak, maar laat persoonsgegevens achter op het apparaat —
  botst met ADR-0001.

## Beslissing

**Optie A.** Eén **sessiemodel** (`src/lib/sessie.ts`):
`{ deelnemer{naam*, geboortedatum?, geslacht?, gewichtKg?}, test{datum, testleider?, notities?,
apparatuur(auto)}, sport, rust, meetpunten[], analyseConfig }`.

- **Naam is verplicht**: visueel gemarkeerd, en straks een harde voorwaarde voor de export.
- **Apparatuur** wordt automatisch afgeleid van de sport (`src/lib/apparatuur.ts`); de exacte
  waarden levert de eigenaar later (nu een TODO-stub).
- Niets in localStorage/server (ADR-0001). Sluit de tab zonder export → data weg (by design).

## Gevolgen

**Positief:** minimale AVG-last blijft intact; één duidelijk model dat later netjes naar JSON kan
(mét `versie`-veld). **Negatief / kosten:** geen autosave; de testleider moet bewust exporteren.

## Toekomstgevolgen

- **Legt vast**: in-sessie model, naam verplicht, apparatuur-automatiek.
- **Houdt open**: JSON-persistence (later, op dit dan-stabiele model) en de echte apparatuur-mapping.
  **Trigger**: apparatuur-data van de eigenaar; persistence na datamodel-stabilisatie.
