# ADR-0026: Klikbare jargon-uitleg via een lab-beheerde woordenlijst

- **Status**: Geaccepteerd
- **Datum**: 2026-07-01
- **Bouwt voort op**: ADR-0021 (template-teksten), ADR-0022 (rapport-component)

## Context

Uit de mockup-feedback was **"veel niet-uitgelegd jargon"** een kernpijnpunt: termen als LT1/LT2,
VT1/VT2, OBLA, VO₂max, VE/VCO₂ en R² staan in het rapport zonder dat de sporter weet wat ze
betekenen. Tegelijk mag het rapport niet vol lopen met voetnoten of de formele, rustige toon
verstoren. We willen uitleg **op aanvraag** (progressive disclosure), niet altijd zichtbaar.

De teksten moeten — net als alle rapporttaal — **door het lab beheerd, deterministisch en zonder
runtime-AI** zijn (ADR-0021). Eén bron van waarheid, geen definities verspreid door de UI.

## Opties

- **A — Klikbare term met eigen popover** (`Term`-component) die de definitie uit één
  `WOORDENLIJST` leest. *Voor:* uitleg op aanvraag; toegankelijk (knop, `aria-expanded`, Escape,
  klik-buiten); geen externe library; één contentbron. *Tegen:* eigen popover-positionering te
  onderhouden.
- **B — Native `title`-tooltip** (browser). *Voor:* nul code. *Tegen:* niet toonbaar op touch, geen
  styling, traag/onbetrouwbaar, slecht toegankelijk.
- **C — Losse woordenlijst-sectie** onderaan het rapport. *Voor:* simpel. *Tegen:* uitleg staat ver
  van de term; de lezer moet heen-en-weer springen; lost het "kaal jargon in context" niet op.
- **D — Externe tooltip-library** (Radix/Floating UI). *Voor:* robuuste positionering. *Tegen:*
  afhankelijkheid + bundelgewicht voor één klein patroon; botst met "geen helpers zonder aanleiding"
  (CLAUDE.md §10).

## Beslissing

**Optie A.** `src/components/Term.tsx` (+ `.css`):
- Een `Term`-component wikkelt een term; toont een klein "?"-teken en opent bij klik een popover met
  de definitie. Sluit op **Escape**, **klik-buiten** en toont `aria-expanded`/`role="tooltip"`.
- **Fail-visible/graceful**: staat er geen definitie in de `WOORDENLIJST`, dan rendert `Term` gewoon
  de kinderen zonder knop — nooit een lege of kapotte popover.
- De definities leven in **één `WOORDENLIJST`-record** in `rapporttekst.ts`, naast de andere
  lab-teksten (ADR-0021). Korte, formele leken-definities; sleutel = de getoonde term.
- Toegepast op de hero-kerngetallen (Aerobe/Anaerobe drempel, VO₂max) en de ademgas-drempels
  (VT1/VT2). Geverifieerd met een Playwright-screenshot (popover geopend).

## Gevolgen

**Positief:** jargon krijgt uitleg **in context, op aanvraag**, zonder de rustige lay-out te vullen;
alle definities op één plek en door het lab te herzien; toegankelijk en zonder extra dependency.
**Negatief / kosten:** de popover-positionering is eigen code (nu: onder de term, rechts-uitgelijnd
op smal scherm); bij veel gelijktijdige termen kan dat later een slimmere plaatsing vergen.

## Toekomstgevolgen

- **Legt vast**: uitleg-op-aanvraag via `Term` + één `WOORDENLIJST` als contentbron; geen aparte
  woordenlijst-pagina, geen tooltip-library.
- **Houdt open**: welke termen nog een `Term` krijgen (bv. OBLA, VE/VCO₂, R² zodra die zichtbaar in
  beeld staan); een eventuele "toon alle definities"-weergave voor de PDF (waar hover/klik wegvalt).
  **Trigger**: PDF-slice (Slice 4) of uitbreiding van de getoonde termen.
