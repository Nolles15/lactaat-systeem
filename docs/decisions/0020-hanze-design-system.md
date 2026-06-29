# ADR-0020: Hanze Design System adopteren — officiële tokens, scherpe vormtaal, SVG-logo

- **Status**: Geaccepteerd
- **Datum**: 2026-06-29
- **Bouwt voort op**: ADR-0006

## Context

De app gebruikte tot nu toe **gegokte** neutralen (groenig #f6f7f4, zachte grijzen), afgeronde
kaarten met zachte schaduw en Arial als "fallback" — netjes, maar door de eigenaar herkend als
**niet echt Hanze**. De eigenaar leverde het **officiële Hanze Design System** aan (zip-export):
primaire kleur + support-palet, een nette neutrale grijs-ramp (#191919…#FFFFFF), spacing/typografie,
component-patronen (header/cards/stats/forms), SVG-logo's + payoff, en de print-fonts.

Belangrijk inzicht uit de gids: de Hanze **web/scherm-kit gebruikt zelf Arial** (de type-scale is in
Arial); **Helvetica Neue is de print-/merkfont**. De Arial-keuze (ADR-0006/briefing) was dus correct
voor het web — geen webfont-laadkost en geen licentiekwestie van het publiceren van een betaald
lettertype in de publieke repo.

## Opties

- **A — Officiële tokens + scherpe Hanze-vormtaal overnemen** in `src/index.css` (token-namen
  behouden, waarden vervangen), SVG-logo i.p.v. PNG. Stijlgids als **springplank**, niet als
  plafond. *Voor:* on-brand bij de bron, samenhangend, herbruikbaar voor het rapport, klein
  (token-laag). *Tegen:* de hele app verschuift visueel (scherper/grijzer) — bewust.
- **B — Eigen, zachtere stijl houden.** *Voor:* geen verandering. *Tegen:* blijft "niet Hanze".
- **C — Helvetica Neue als webfont bundelen.** *Voor:* exact de merkfont. *Tegen:* onnodig (de
  web-kit gebruikt Arial), extra laadkost, en licentievraag bij publiceren in de publieke repo.

## Beslissing

**Optie A.** Concreet in `src/index.css`:
- Officiële **kleur-ramp** (primair + support) en **neutrale grijs-ramp** als tokens; de bestaande
  semantische tokens (`--kleur-tekst/-zwak/-rand/-achtergrond/-paneel`) wijzen nu naar die ramp.
- **`--radius: 0`** — scherpe hoeken (Hanze-vormtaal); hardcoded radii in `App.css` lopen nu via
  de token.
- **Hanze-signatuur** op panelen: oranje accentbalk bovenaan + vierkant oranje nummer-badge.
- **Arial** blijft expliciet de web-font (officieel); Helvetica Neue = print/merk, niet in de app.
- **SVG-logo** (`src/assets/hanze-logo.svg`) i.p.v. de PNG (scherper).
Geverifieerd via Playwright-screenshots (Slice 3b): before/after op desktop/tablet/mobiel.

## Gevolgen

**Positief:** de app is nu on-brand bij de bron; één tokenlaag stuurt de hele UI; geen
font-licentie-/laadgedoe; klaar als fundament voor het rapport. **Negatief / kosten:** de bestaande
schermen verschuiven visueel (scherper, grijzere achtergrond) — bewust geaccepteerd en gezien.

## Toekomstgevolgen

- **Legt vast**: het officiële Hanze Design System is de bron van waarheid voor stijl-tokens;
  **Arial = web, Helvetica Neue = print**; scherpe vormtaal (`--radius: 0`).
- **Houdt open**: diepere overname van component-patronen (buttons/forms/cards uit de kit) en de
  **design-elevation-laag** (Slice 3c) bovenop de stijlgids — *springplank, geen plafond*.
  **Trigger**: de rapport-bouw en de design-elevation.
