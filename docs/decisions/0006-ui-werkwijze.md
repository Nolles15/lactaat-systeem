# ADR-0006: UI-werkwijze — code-first met gecentraliseerd Hanze-thema

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0004

## Context

De app moet de Hanze-huisstijl volgen (briefing 3.5: kleuren, Arial, logo). De briefing noemt ook
een optioneel ontwerp-pad via Claude Design met een handoff-bundle (sectie 0). De vraag is wie het
visuele ontwerp doet en wanneer — en hoe we voorkomen dat een latere restyle een herschrijving wordt.

## Opties

- **A — Code-first met gecentraliseerd thema.** Ik bouw de UI nu in code, on-brand, met de
  huisstijl als tokens (CSS-variabelen) en presentatie-lichte componenten. *Voor:* snelste weg naar
  een bruikbare, live tool (echt testen, ADR-0002); restyle later goedkoop. *Tegen:* geen
  interactieve designverkenning vooraf.
- **B — Claude Design eerst, dan handoff.** Meer ontwerp-aandacht vooraf, maar trager en vergt
  designwerk van de eigenaar.
- **C — Kaal-functioneel nu, huisstijl later.** Schuift de huisstijl voor zich uit.

## Beslissing

**Optie A.** Concreet:

- De huisstijl leeft als **gecentraliseerde tokens** in `src/index.css` (kleur, typografie, ruimte).
- Componenten zijn **presentatie-licht**; de rekenlogica zit al los in `src/lib` (ADR-0004).
- Daardoor is een latere **restyle of een Claude Design handoff** (briefing sectie 0) goedkoop:
  tokens en layout vervangen, niet de logica.

## Gevolgen

**Positief:** snel iets bruikbaars en live, on-brand; layout/visueel later omkeerbaar zonder de
kern te raken. **Negatief / kosten:** de eerste vormgeving is "netjes en functioneel", niet het
resultaat van een aparte ontwerpronde — bewust geaccepteerd, want herbouwbaar.

## Toekomstgevolgen

- **Legt vast**: token-gebaseerde huisstijl + scheiding presentatie/logica als UI-conventie.
- **Houdt open**: een latere Claude Design handoff of restyle, en een apart PDF-rapport-template.
  **Trigger**: zodra de eigenaar een ontwerpronde wil, of een handoff-bundle aanlevert.
