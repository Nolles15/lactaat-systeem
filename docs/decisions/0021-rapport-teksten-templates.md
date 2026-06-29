# ADR-0021: Rapport-teksten via deterministische templates — geen AI in het systeem

- **Status**: Geaccepteerd
- **Datum**: 2026-06-29
- **Bouwt voort op**: ADR-0019

## Context

Het rapport heeft begrijpelijke, **gestandaardiseerde** interpretatie-zinnen nodig ("wat dit getal
betekent"), consistent over alle rapporten. Harde eis van de eigenaar: er mag **geen AI in het
systeem** draaien — vanwege foutrisico (een taalmodel kan hallucineren), AVG en de wens dat het lab
controle houdt over élke zin. Tegelijk: géén trainingsadvies (eigenaar-besluit), wel neutrale,
fysiologische duiding.

## Opties

- **A — Vaste sjablonen met data-placeholders** (deterministisch). Eén plek met de zinnen (de "pen"
  van het lab), gevuld uit het rapport-model. *Voor:* herhaalbaar, controleerbaar, testbaar, geen
  AI/AVG-risico, lab beheert de bewoording. *Tegen:* sjabloonmatig — geen vrije nuance per persoon.
- **B — AI-gegenereerde teksten** (runtime LLM). *Voor:* vloeiend, persoonlijk. *Tegen:* **valt af**
  — verboden (eis); foutrisico/hallucinatie; AVG.
- **C — Per rapport met de hand geschreven.** *Voor:* maximale controle per geval. *Tegen:* niet
  schaalbaar, inconsistent, foutgevoelig.

## Beslissing

**Optie A.** `src/lib/rapporttekst.ts`:
- Een `SJABLONEN`-constant met de vaste zinnen (LT1/LT2/OBLA-betekenis, curve, betrouwbaarheid,
  VO₂max + %-voorspeld-uitleg, combinatie). Dit is de plek waar het lab de bewoording aanpast.
- Pure functies vullen de sjablonen uit `RapportModel` via `vul()` — deterministisch, geen LLM.
- **Defensief/fail-visible**: ontbrekende/onbetrouwbare data → `null` of de lage-R²-variant; geen
  stellige zin als die niet gedragen wordt.
- **Geen advies**: alleen neutrale, fysiologische duiding; LT2 heet "het berekende kantelpunt"
  (nooit "ModDmax").
- De lactaat↔ademgas-duiding (bevestigen elkaar / lopen uiteen) hangt aan één **heuristiek**
  `CONSISTENT_DREMPEL_BPM` — bewust op één plek, door het lab te ijken (geen schijnprecisie verstopt
  in de tekst).
14 tests dekken determinisme, fail-visible en het uiteenloop-geval.

## Gevolgen

**Positief:** herhaalbare, consistente teksten; het lab houdt de pen; volledig testbaar; geen
runtime-AI/AVG-risico. **Negatief / kosten:** de teksten zijn generiek (sjabloonmatig); fijne nuance
per persoon ontbreekt — bewust geaccepteerd boven het risico van AI-fouten.

## Toekomstgevolgen

- **Legt vast**: rapport-teksten = deterministische templates uit het model; **geen AI in het
  systeem**.
- **Houdt open**: het lab verfijnt de `SJABLONEN`-bewoording; `CONSISTENT_DREMPEL_BPM` ijken op
  echte data; meer zinnen toevoegen naarmate het rapport groeit. **Trigger**: review van de teksten
  door het lab.
