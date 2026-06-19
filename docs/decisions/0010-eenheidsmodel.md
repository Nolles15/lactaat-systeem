# ADR-0010: Eenheidsmodel — snelheid bij invoer, pace bij uitvoer (lopen)

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0004

## Context

Bij lopen werkt het loopbandsysteem in **snelheid (km/u)**, terwijl sporters in **pace (min/km)**
denken. De testleider voert dus snelheid in, maar de uitkomst moet primair in pace worden
gecommuniceerd. Intern wordt al in km/u gerekend (ADR eerder); alleen de weergave verschilt per
context.

## Opties

- **A — Context-afhankelijke weergave.** Invoer toont snelheid (primair) + pace (afgeleid); uitvoer
  (resultaten, zones, grafiek) toont pace (primair) + snelheid (secundair). Intern: km/u.
- **B — Eén eenheid overal.** Simpeler, maar negeert dat invoer (apparatuur) en uitvoer (sporter)
  verschillende talen spreken.

## Beslissing

**Optie A.**

- **Invoer (lopen)**: veld = **snelheid (km/u)**; pace wordt eronder afgeleid getoond.
- **Uitvoer (lopen)**: **pace primair**, snelheid secundair — in resultaten, zones en de grafiek-as.
- Intern blijft km/u de rekeneenheid; `paceToKmh`/`kmhToPace` doen alleen de weergave.

## Gevolgen

**Positief:** sluit aan op zowel de apparatuur (invoer) als de sporter (uitvoer); geen verwarring.
**Negatief / kosten:** twee weergavecontexten om consistent te houden.

## Toekomstgevolgen

- **Legt vast**: km/u intern; snelheid-in / pace-uit voor lopen.
- **Houdt open**: extra sporten/eenheden (roeien W of min/500m). **Trigger**: bij een nieuwe sport.
