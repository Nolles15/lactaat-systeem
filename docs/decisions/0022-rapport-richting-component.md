# ADR-0022: Rapport-scherm — gekozen combi-richting, module-gestuurd, geen advies

- **Status**: Geaccepteerd
- **Datum**: 2026-06-29
- **Bouwt voort op**: ADR-0018, ADR-0019, ADR-0021

## Context

Na drie mockups (Cockpit / Reisverhaal / Speeltuin), een jury-ronde en feedback van de eigenaar +
een collega is de ontwerprichting gekozen: **combineren**. Het reisverhaal (B) met sterke
onderbouwing als basis, de kerngetallen-hero en interactieve grafiek uit de Speeltuin (C) erin, met
expliciete correcties: **geen trainingsadvies**, formele toon, **module-gestuurde boventoon**
(lactaat óf ademgas primair), LT2 omschreven als "berekend kantelpunt" (nooit "ModDmax"). Het
fundament staat: `rapportmodel.ts` (ADR-0019) + `rapporttekst.ts` (ADR-0021) + Hanze Design System
(ADR-0020).

## Opties

- **A — De gekozen combi** in één React-component (`Rapport.tsx`) die **uitsluitend** uit het
  rapport-model + de template-teksten leest. *Voor:* één renderer/bron van waarheid (geen drift),
  herbruikbaar voor web, PDF én de deel-viewer; module-gestuurd. *Tegen:* de world-leading
  designlaag komt pas in een vervolgslice.
- **B — Eén van de losse richtingen** (puur Cockpit/Reisverhaal/Speeltuin). *Voor:* simpeler.
  *Tegen:* afgewezen — de eigenaar wil bewust de mix.

## Beslissing

**Optie A.** `src/components/Rapport.tsx` (+ `Rapport.css`):
- **Hero** met gelijke kerngetallen (schone getallen, subtiel oranje accent voor de primaire test) +
  single-answer-first samenvatting.
- **Inspanningscurve** (nu de bestaande Recharts-grafiek hergebruikt) + curve-beschrijving +
  R²-eerlijkheid; **drempels** (LT1/LT2/OBLA) met neutrale "Wat dit betekent"-blokken; **zones**
  (labmodel) met neutrale fysiologische omschrijving — **geen advies**; **ademgasanalyse** met korte
  apparatuur-/testtype-uitleg; **twee metingen vergeleken** mét het uiteenloop-geval; **disclaimer**
  (werk-/hygiëneprotocol — placeholder).
- **Module-gestuurd**: de primaire test leidt; alleen actieve modules worden getoond.
- Bereikbaar via "Toon rapport" in `App.tsx`; gebouwd op `bouwRapportModel`.
- Geverifieerd met Playwright-screenshots (Slice 3b) op een voorbeeldsessie.

## Gevolgen

**Positief:** functioneel-correct rapport, één bron van waarheid, herbruikbaar voor PDF en de
deel-viewer; on-brand. **Negatief / kosten:** de grafiek is nu de generieke Recharts-curve (geen
annotatie-/scrubber-/scrollytelling-laag) en de typografische/motion-polish ontbreekt nog — bewust,
dat is de volgende slice.

## Toekomstgevolgen

- **Legt vast**: de combi-richting; rapport leest puur uit model + teksten; module-gestuurde
  boventoon; geen trainingsadvies; LT2 = "berekend kantelpunt".
- **Houdt open**: de **design-elevation** naar wereldklasse (Slice 3c: custom geannoteerde curve,
  scrollytelling, scrubber, motion — raakt ADR-0007 grafiek-tech), **PDF-export** (Slice 4),
  **interactief delen** (Slice 5), en de open inhoud (zone-methode-vergelijking, disclaimer-tekst,
  %-voorspeld-norm, apparatuur-teksten). **Trigger**: Slice 3c.
