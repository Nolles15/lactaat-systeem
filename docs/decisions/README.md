# Beslislogboek (ADR's)

Architectonische beslissingen leven hier als genummerde markdown-bestanden:
`0001-onderwerp.md`, `0002-….md`, … Doel: **elke niet-triviale keuze is bewust, gemotiveerd
en vindbaar** — het anti-legacy-mechanisme (CLAUDE.md §4).

## Wanneer een ADR aanmaken

- Tech-stack-keuze (framework, database, hosting, library met grote impact).
- Datamodel-keuzes met blijvende gevolgen (geld, tijdzones, eenheden, identifiers).
- Conventies die door het hele project gelden (auth, foutafhandeling, taal in code).
- UX-/visuele patronen die overal terugkomen.
- Bewuste **niet**-keuzes ("we doen X nu nog niet, omdat…").

## Proces

1. Niet-triviale keuze? → opties + aanbeveling + toekomstgevolgen (CLAUDE.md §2).
2. Eigenaar beslist.
3. Leg de uitkomst vast als ADR (mag in dezelfde commit als de implementatie ervan).
4. Een ADR wijzigen = een nieuwe ADR met status "Vervangt ADR-XXXX" of een gedateerd
   **Addendum** onderaan — niet stilzwijgend overschrijven.

## Format

```markdown
# ADR-XXXX: <korte titel>

- **Status**: Voorgesteld | Geaccepteerd | Vervangen door ADR-YYYY
- **Datum**: YYYY-MM-DD
- **Bouwt voort op**: (optioneel) ADR-XXXX

## Context
Wat is de situatie/het probleem? Welke krachten spelen?

## Opties
Min. 2, met voor- en nadelen.

## Beslissing
Wat is gekozen, en waarom (de aanbeveling die is overgenomen).

## Gevolgen
Positief en negatief/kosten.

## Toekomstgevolgen
- **Legt vast**: wat ligt nu vast.
- **Houdt open**: wat blijft bewust open (met de trigger om het te beslissen).
```
