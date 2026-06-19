# ADR-0008: Ruststap als baseline, niet in de curve-fit

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0002

## Context

Op verzoek is er een vaste ruststap (intensiteit 0) toegevoegd aan de meetpunten. De vraag is of
die rustwaarde meedoet in de polynoom-fit, of alleen dient als baseline voor LT1. Dit raakt de
drempelwaarden waarop sporters trainen, dus het is een bewuste domeinkeuze (CLAUDE.md §2).

## Opties

- **A — Alleen baseline.** De curve wordt gefit over de belastingsstappen; de rustwaarde voedt de
  LT1-baseline (laagste van rust + eerste stapwaarden). *Voor:* voorkomt dat het punt op x=0 de
  polynoom aan de onderkant vertekent (zeker bij graad 3/4). *Tegen:* de rustwaarde stuurt de
  curve-vorm niet.
- **B — Rust meefitten.** De rustwaarde (x=0) doet mee als volwaardig punt. *Voor:* meer data,
  ankert laag. *Tegen:* kan de curve aan de onderkant trekken/vertekenen.

## Beslissing

**Optie A.** De fit gebruikt alleen de belastingsstappen; de ruststap wordt wél getoond als
meetpunt in de grafiek en bepaalt mee de LT1-baseline. Dit is een rekenparameter en omkeerbaar.

## Gevolgen

**Positief:** stabielere curve aan de onderkant; rust blijft zichtbaar en relevant voor LT1.
**Negatief / kosten:** als een protocol rust juist wél wil meefitten, wijkt dit daarvan af.

## Toekomstgevolgen

- **Legt vast**: rust = baseline/visueel meetpunt, niet in de fit.
- **Houdt open**: meefitten alsnog (optie B) als de praktijk daarom vraagt. **Trigger**: afwijking
  bij echt testen, of een protocol-eis. Eenvoudig om te zetten (één plek in `analyse.ts`).
