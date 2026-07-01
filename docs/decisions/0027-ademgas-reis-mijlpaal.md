# ADR-0027: De ademgas-reis — mijlpaal-scrollytelling zonder verzonnen curve

- **Status**: Geaccepteerd
- **Datum**: 2026-07-01
- **Bouwt voort op**: ADR-0019 (anti-fabricatie), ADR-0021 (template-teksten), ADR-0025 (lactaat-reis)

## Context

De lactaattest heeft een geleide "reis" (ADR-0025): een sticky lactaatcurve die zich opbouwt terwijl
je scrolt. Een **alleen-ademgas-rapport** miste die volledig — het was een hero + een kale tabel,
terwijl de eigenaar ademgas als **volwaardige, gelijkwaardige test** ziet (bevestigd). Zo'n rapport
verdient dezelfde verhaalvorm.

Maar ademgas heeft **geen doorlopende curve**: VO₂ is niet per Watt af te leiden, dus een sleepbare
VO₂-curve zou een **verzonnen vorm** zijn — precies wat ADR-0019 verbiedt. We hebben alleen échte
losse mijlpalen: VO₂max, VT1, VT2 (elk met een gemeten VO₂-niveau en hartslag) en de hartslagpiek.

## Opties

- **A — Mijlpaal-reis**: sticky scrollytelling met een **VO₂-"ladder"** (verticale balk = zuurstof-
  capaciteit) waarop VT1, VT2 en de piek als écht gemeten markeringen oplichten terwijl je door de
  stappen scrolt. *Voor:* zelfde geleide verhaalvorm als lactaat; volledig eerlijk (alleen gemeten
  punten); herbruikt de reis-layout. *Tegen:* geen "sleep zelf"-interactie (er is geen continue
  functie om af te lezen).
- **B — Schematische ventilatiecurve**: een opbouwende VE-curve met VT1/VT2 als knikpunten, visueel
  analoog aan lactaat. *Tegen:* we hebben geen doorlopende VE-per-intensiteit-data → de curvevorm
  zou illustratief/verzonnen zijn. **Botst met ADR-0019.**
- **C — Statische tabel laten** (huidige situatie). *Tegen:* mist de gewaardeerde reis; het
  ademgas-rapport blijft mager.

## Beslissing

**Optie A** (door de eigenaar gekozen via keuze-popup). `src/components/AdemgasReis.tsx` (+ `.css`,
deelt `RapportReis.css` voor de layout):
- Sticky **VO₂-ladder** (ml/kg/min-as) die zich opbouwt (`scaleY` draw-in); VT1 (groen), VT2
  (oranje) en VO₂max/piek (zwart) verschijnen als markeringen met hun gemeten VO₂-niveau + hartslag.
- `IntersectionObserver` bepaalt de actieve stap; markeringen lichten op naarmate je verder scrolt
  (zelfde patroon als de lactaat-reis).
- Stappen (VO₂max → VT1 → VT2 → piek) komen uit de template-laag (`ademgasReisStappen`,
  `rapporttekst.ts`); **defensief** — een stap verschijnt alleen als zijn data er is.
- Getoond wanneer **ademgas de primaire test** is (nu: alleen-ademgas). In een combitest leidt de
  lactaat-reis en blijft ademgas het compacte aanvullende deel — geen dubbele scrollytelling.
- `prefers-reduced-motion` gerespecteerd. Geverifieerd met een alleen-ademgas-screenshot.

## Gevolgen

**Positief:** ook het alleen-ademgas-rapport is nu een geleide reis; volledig eerlijk aan de data
(geen verzonnen curve); één consistente verhaalvorm en gedeelde layout met de lactaat-reis.
**Negatief / kosten:** de ademgas-reis mist de "sleep zelf"-interactie van de lactaatcurve (kan niet
anders zonder continue meting); in een combitest krijgt ademgas (bewust) geen eigen reis.

## Toekomstgevolgen

- **Legt vast**: ademgas-scrollytelling is een **mijlpaal**-vorm, geen curve; alleen gemeten
  waarden. De primaire test bepaalt welke reis opent (module-gestuurd, ADR-0018).
- **Houdt open**: de "boventoon" kan later expliciet instelbaar worden (nu: lactaat primair zodra
  aanwezig); een statische reis-variant voor de PDF (Slice 4); of ademgas óók een reis in de
  combitest als dat gewenst blijkt. **Trigger**: PDF-slice of een boventoon-herziening.
