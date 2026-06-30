# ADR-0025: De reis — sticky-graphic scrollytelling in het rapport

- **Status**: Geaccepteerd
- **Datum**: 2026-06-30
- **Bouwt voort op**: ADR-0022, ADR-0023

## Context

Uit de mockup-feedback bleek de **"reis door het verhaal"** (een sticky grafiek die blijft staan
terwijl je scrolt en zich opbouwt) het element dat de eigenaar het meest waardeerde. In de eerste
bouw ontbrak die: bij het opknippen in slices schoof het naar een als **"optioneel"** gelabeld
vervolg-item, en is het functionele rapport een gestapeld dashboard geworden. Dat was een stille
scope-versmalling (erkend; CLAUDE.md §5). Deze ADR herstelt dat: de reis wordt alsnog de
kern-opening van het rapport.

## Opties

- **A — Sticky-graphic scrollytelling** met `IntersectionObserver`: de SVG-curve blijft staan en
  bouwt zich stap voor stap op (curve → LT1 → LT2 → zones) terwijl tekst-stappen langs scrollen.
  *Voor:* precies de gewaardeerde verhaalvorm; progressive disclosure; lichte, bewezen techniek.
  *Tegen:* werkt niet in print (PDF vergt een statische variant).
- **B — Statisch gestapeld** laten (huidige situatie). *Tegen:* mist juist het gewaardeerde element.
- **C — Scroll-driven CSS** (`animation-timeline: scroll()`). *Voor:* geen JS. *Tegen:* nieuwer,
  wisselende browserondersteuning; minder controle over de stap-logica.

## Beslissing

**Optie A.** `src/components/RapportReis.tsx` (+ `.css`):
- Sticky SVG-curve (links op desktop, bovenaan op mobiel) die zich opbouwt; `IntersectionObserver`
  met gecentreerde `rootMargin` bepaalt de actieve stap; highlights (LT1 groen, LT2 oranje + arcering
  boven de drempel, zone-banden) faden zachtjes in. De curve **tekent zichzelf** bij verschijnen.
- **Respecteert `prefers-reduced-motion`** en heeft een **mobiele fallback** (één kolom, grafiek
  sticky bovenaan).
- Teksten komen uit de template-laag (`rapporttekst.ts`, ADR-0021) — geen verzonnen data.
- De **interactieve scrubber-grafiek** (ADR-0023) verhuist naar een aparte sectie
  **"Verken je eigen curve"** onderaan — de reis is de geleide opening, de scrubber het naspelen.
- Geverifieerd met Playwright-screenshots op meerdere scrollposities.

## Gevolgen

**Positief:** het rapport *leidt* de lezer (de gewaardeerde reis); een onderscheidend, on-brand
verhaal-moment; progressive disclosure (kern eerst, detail eronder). **Negatief / kosten:**
scrollytelling vertaalt niet naar PDF → daar is een statische variant nodig (Slice 4); er is lichte
narratieve overlap tussen de reis en de drempel-referentiekaarten (kan later strakker).

## Toekomstgevolgen

- **Legt vast**: de reis (sticky scrollytelling) is de opening van het lactaat-deel; de scrubber is
  de "verken zelf"-sectie.
- **Houdt open**: een **statische reis-variant voor de PDF** (Slice 4), het strakker ontdubbelen van
  reis vs. referentiekaarten, en bredere typografie-/motion-polish. **Trigger**: PDF-slice of een
  volgende design-ronde.
