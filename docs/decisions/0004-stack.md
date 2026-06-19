# ADR-0004: Stack — Vite + React + TypeScript

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0001

## Context

ADR-0001 kadert de bouw in: de app draait **client-side**, heeft **geen backend** nodig en is
**statisch hostbaar**. De bestaande logica is geschreven in React (JSX) met Recharts voor de
lactaatcurve (scatter + gefitte curve + referentielijnen + D-max-lijn). We kiezen een bouwwijze die
daarop aansluit en snel naar "echt testen" leidt (ADR-0002, ADR-0003).

## Opties

- **A — Vite + React + TypeScript.** Behoudt de React-logica en Recharts; lean SPA die statisch
  bouwt. TypeScript omdat de briefing al types levert en de rekenkern baat heeft bij
  typeveiligheid. *Voor:* minste werk, kleinste footprint, past op ADR-0001. *Tegen:* geen
  ingebouwde routing/SSR (niet nodig hier).
- **B — Next.js (statische export).** Ook React, maar de sterke punten (SSR, API-routes) zijn
  ongebruikt en deels verboden door ADR-0001. Meer configuratie/concepten dan nodig.
- **C — Herschrijven zonder React.** Verliest de bestaande React/Recharts-code zonder duidelijke
  winst.

## Beslissing

**Optie A — Vite + React + TypeScript**, met **Recharts** voor de grafiek.

- TypeScript voor de hele app; de bestaande JSX-logica wordt naar TS gemigreerd (de rekenkern
  eerst, met de fixtures uit ADR-0002 als vangnet).
- Geen extra libraries "alvast" (CLAUDE.md §10): state, PDF-export e.d. komen pas met een concrete
  aanleiding en — waar niet-triviaal — een eigen ADR.

## Gevolgen

**Positief:** snelste pad naar een werkende, testbare app; bestaande logica en grafiek blijven
bruikbaar; statische build = simpele, goedkope hosting zonder serverbeheer. **Negatief / kosten:**
routing/state moeten we zelf klein houden; migratie JSX → TS kost wat initieel werk (maar dekt
direct de rekenkern af).

## Toekomstgevolgen

- **Legt vast**: SPA op Vite, React + TypeScript, Recharts voor de curve.
- **Houdt open**: hosting-platform (volgende ADR), PDF-bibliotheek, en of er later state-/
  routing-libraries nodig zijn. **Trigger**: bij de eerste concrete behoefte (bijv. de
  export-feature → PDF-ADR).
