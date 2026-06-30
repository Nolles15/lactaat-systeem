# ADR-0024: Sporter-viewer — kale alleen-lezen rapportpagina (delen, Route A)

- **Status**: Geaccepteerd
- **Datum**: 2026-06-30
- **Bouwt voort op**: ADR-0001, ADR-0016, ADR-0022

## Context

Het rapport bestond alleen *binnen* de testleider-app (knop "Toon rapport", met alle invoervelden
eromheen). De eigenaar wil een **aparte, simpele pagina** om naar sporters te sturen waar het
rapport wordt getoond. Kaders staan vast: **alleen testleider maakt + deelt**, sporter heeft geen
account, **bestand-gebaseerd**, **geen opslag/server** (ADR-0001). De interactieve versie is voor de
sporter de kern (niet alleen een PDF).

## Opties

- **A — Read-only viewer + JSON.** Een kale pagina op `.../?rapport` die de meegestuurde JSON laadt
  en **alleen het rapport** toont (hergebruikt dezelfde React-`Rapport`-component → één renderer,
  geen drift). Sporter krijgt: link + JSON-bestand. *Voor:* minste bouw, binnen ADR-0001, simpel.
  *Tegen:* sporter moet één keer een bestand laden.
- **B — Self-contained interactief HTML-bestand.** Eén bestand dat de sporter dubbelklikt. *Voor:*
  geen laadstap. *Tegen:* meer build-tooling (één-bestand-bundel). → later (Slice 5b).
- **C — Deelbare link mét data/centrale opslag.** *Tegen:* valt af — heropent ADR-0001 (privacy).

## Beslissing

**Optie A** (Route B blijft open als vervolg). Concreet:
- `src/components/Viewer.tsx` (+ `.css`): een kale pagina met een uitnodigend laadscherm
  ("Bekijk je testrapport" → "Open je rapport (.json)") + privacy-geruststelling; na het laden
  rendert het de bestaande `Rapport`-component. Hergebruikt `jsonNaarSessie` (ADR-0016) +
  `bouwRapportModel` (ADR-0019).
- `main.tsx`: geen router nodig (statische host, ADR-0005) — bij de query `?rapport` rendert de
  app de `Viewer` i.p.v. de volledige app.
- In de testleider-app verschijnt in rapportmodus een **deel-hint** met de sporter-link.
- Geverifieerd met Playwright-screenshots (leeg + na laden).

## Gevolgen

**Positief:** een simpele, on-brand sporter-pagina die de **interactieve** ervaring levert; één
renderer (geen tweede waarheid); volledig binnen ADR-0001 (niets opgeslagen/verstuurd). **Negatief
/ kosten:** de sporter moet de link openen én het bestand laden (twee dingen); de link toont zonder
bestand alleen het laadscherm.

## Toekomstgevolgen

- **Legt vast**: `?rapport` als deel-/viewerroute; sporter-toegang is **bestand-gebaseerd**, geen
  account/opslag.
- **Houdt open**: **Route B** (self-contained HTML-export, Slice 5b) voor het "stuur-één-bestand"-
  gemak; PDF-export (Slice 4); evt. een QR-code naar de viewerlink. **Trigger**: wens voor
  laagdrempeliger delen.
