# ADR-0013: Layout-herontwerp — gepolijste één-koloms cockpit

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0006

## Context

De app moest naar een professionele, "top-tier" uitstraling. Gekozen richting (eigenaar): **één
kolom, gepolijst**, met genummerde, duidelijke secties — robuust voor de brede meetpunten-tabel én
de grote grafiek, en goed op tablet.

## Beslissing

- **App bezit de sectie-structuur**: elke stap is een `.paneel` met een genummerde kop
  (1 Intake → 2 Meetpunten → 3 Analyse → 4 Trainingszones). De componenten renderen alleen hun
  inhoud (geen eigen `<section>`/`<h2>`).
- Visuele polish via de bestaande tokens (ADR-0006): rustige kaarten, duidelijke hiërarchie,
  Hanze-accent (oranje nummer-badge), voldoende witruimte, responsive.
- De sport-toggle verhuist naar een toolbar boven de meetpunten-tabel.

## Gevolgen

**Positief:** consistente, professionele structuur; één plek (App) voor de sectie-indeling;
componenten worden eenvoudiger. **Negatief / kosten:** een eenmalige refactor van de
component-grenzen (geen functionele wijziging).

## Toekomstgevolgen

- **Legt vast**: genummerde één-koloms sectie-indeling, App-owned.
- **Houdt open**: een latere Claude Design-verfijning of een twee-koloms variant — goedkoop omdat
  de tokens en de logica los staan. **Trigger**: designronde of eigenaarswens.
