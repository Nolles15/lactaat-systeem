# ADR-0003: Premisse en scope (v1)

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19

## Context

De lactaattest wordt in het Hanze Inspanningslab handmatig ondersteund door een bestaande
single-file tool. Het doel is die om te zetten naar een webapp met testhistorie, vergelijking en
een PDF-rapport in huisstijl. Vóór er gebouwd wordt, leggen we vast wie de gebruiker is, wat de
waarde is, wat succes is, en — bepalend voor alle volgende keuzes — hoe breed v1 is.

## Opties (scope)

- **A — Alleen lab-testleiders.** Intern hulpmiddel; geen sporter-accounts. Kleinste privacy-
  oppervlak en de kleinste bouw. *Voor:* snel, eenvoudig, past op ADR-0001. *Tegen:* sporters
  kunnen niet zelf online inloggen (krijgen wel hun PDF).
- **B — Testleiders + sporters eigen resultaten.** Groter privacy-oppervlak, accountbeheer,
  zwaardere AVG-plicht.
- **C — Meerdere labs / instellingen.** Multi-tenant; grootste complexiteit, vrijwel zeker te vroeg.

## Beslissing

**Optie A.**

**Premisse:**
- **Wat** — een webapp die de bestaande drempelberekening (LT1, LT2 via D-max, OBLA, polynoomfit,
  trainingszones) en pace-conversie omzet naar een bruikbaar testleider-gereedschap, met invoer,
  grafiek, drempels, zones en een PDF-rapport in Hanze-huisstijl.
- **Voor wie** — testleiders van het Hanze Inspanningslab (SportsFieldsLab Groningen).
- **Waarom uniek** — koppelt de berekening aan de lab-protocollen (HYG-001, WRK-001), de
  Hanze-huisstijl en herhaalbare testhistorie per sporter; geen generieke tool.
- **Succes (werkdefinitie)** — een testleider kan een volledige test invoeren, de drempels en
  zones zien, en een PDF-rapport genereren — zonder de oude tool nog nodig te hebben — en de data
  via een bestand bewaren/herinladen (ADR-0001).

## Gevolgen

**Positief:** kleine, scherpe scope; past naadloos op de privacy- en stackkeuzes. **Negatief /
kosten:** sporters hebben geen eigen online toegang in v1.

## Toekomstgevolgen

- **Legt vast**: intern testleider-gereedschap, één lab, geen sporter-/multi-tenant-functionaliteit
  in v1.
- **Houdt open**: sporter-toegang en bredere uitrol (briefing V3). **Trigger**: zodra het lab dat
  echt nodig heeft → nieuwe ADR, en heroverweegt ADR-0001 (privacy).
