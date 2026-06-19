# ADR-0009: Trainingszone-model — drempelzones én 5-zone model

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0008

## Context

De app moet trainingszones tonen op basis van LT1 en LT2. De briefing geeft twee varianten: een
uitgebreid 5-zone model (sectie 3.5, met LT1−10% en het middelpunt) en een eenvoudiger model
(sectie 2). De zones bepalen waarop sporters trainen — een bewuste domeinkeuze (§2).

## Opties

- **A — Alleen 5-zone (3.5).** Granulair (A1/A2/A2+/B/C).
- **B — Alleen simpel (§2).** Vier zones, dicht op de drempels.
- **C — Beide tonen.** De drie zones rechtstreeks op de drempels (< LT1 / LT1–LT2 / > LT2) én het
  uitgebreide 5-zone model.

## Beslissing

**Optie C.** De app toont **beide**, beide duidelijk:

1. **Drempelzones** — drie zones rechtstreeks op LT1/LT2: `< LT1`, `LT1–LT2`, `> LT2`. Direct
   herleidbaar tot de drempels.
2. **Trainingszones (5-zone, briefing 3.5)** — A1 (`< LT1−10%`), A2 (`LT1−10% … LT1`),
   A2+ (`LT1 … mid(LT1,LT2)`), B (`mid … LT2`), C (`> LT2`).

Grenzen worden getoond in de rekeneenheid (Watt; bij lopen pace + km/u). Beide vereisen LT1 én LT2.

## Gevolgen

**Positief:** de eenvoudige drempel-logica blijft transparant naast het gedetailleerde model;
testleider kan kiezen wat hij communiceert. **Negatief / kosten:** twee tabellen i.p.v. één — iets
meer scherm.

## Toekomstgevolgen

- **Legt vast**: beide modellen, afgeleid van LT1/LT2; 5-zone volgens briefing 3.5.
- **Houdt open**: HF-/RPE-grenzen per zone (V2), en het exacte −10%/midpoint-recept. **Trigger**:
  als de lab-methodiek andere grenzen hanteert → aanpassen in `zones.ts` (één plek).
