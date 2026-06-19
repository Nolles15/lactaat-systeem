# ADR-0002: Verificatiestrategie van de rekenkern

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0001

## Context

De rekenkern (polynoomfit, LT1, LT2 via D-max, OBLA, pace-conversie, trainingszones) bepaalt de
zones waarop sporters daadwerkelijk trainen. Een stille fout hier is de duurste soort — precies de
valkuil die de kit wil afvangen (CLAUDE.md §3). We moeten kunnen aantonen dát het klopt, vóór we
het vertrouwen of deployen, en bij elke wijziging opnieuw.

Er is een bestaande, in de praktijk gebruikte tool waarvan het lab de uitkomsten vertrouwt. De
eigenaar wil pragmatisch starten en snel in de echte testpraktijk valideren.

## Opties

- **A — Bestaande tool als oracle.** Echte testen uit de huidige tool (invoer + berekende
  drempels) worden vaste testcases; de nieuwe rekenkern moet dezelfde waarden reproduceren binnen
  tolerantie. *Voor:* snel, data is beschikbaar. *Tegen:* een eventuele fout in de oude tool wordt
  meegeërfd.
- **B — Onafhankelijke referentiecases** (literatuur/handmatig). *Voor:* bewijst de methode.
  *Tegen:* meer werk om te sourcen, minder real-world variatie.
- **C — Beide.** Strengste, maar meer opzetwerk.

## Beslissing

**Optie A**, met de praktijk als tweede laag: bestaande tool = oracle, en daarna **zo snel mogelijk
echt testen** in het lab.

Concreet:
- Een set **echte testen** (invoer + de door de huidige tool berekende LT1/LT2/OBLA) wordt
  opgenomen als **vaste testfixtures**. De nieuwe rekenkern moet die binnen een afgesproken
  tolerantie reproduceren.
- Deze fixtures vormen de kern van de **CI-test-gate**; met branch protection wordt dat een muur
  (CLAUDE.md §11). Opzet volgt samen met de hosting-keuze.
- **Fail-visible randen** (CLAUDE.md §3) horen bij de rekenkern, niet als nette-dag-aanname:
  OBLA "niet bereikt" tonen i.p.v. raden; R² tonen zodat de testleider de fitkwaliteit beoordeelt;
  waarschuwen bij lactaat < 0 of > 15 en bij te weinig punten voor de gekozen polynoomgraad.
- **Echt testen** door een testleider bevestigt bovenop de gate; het vervángt de gate niet.

## Gevolgen

**Positief:** snel te realiseren, data beschikbaar, en de fixtures beschermen meteen tegen
regressies. **Negatief / kosten:** een fout in de oude tool zou onopgemerkt mee kunnen komen —
gemitigeerd door de zichtbare randen (R²/grenzen), door snel echt te testen, en door later
onafhankelijke referentiecases te kunnen toevoegen.

## Toekomstgevolgen

- **Legt vast**: oracle = bestaande tool; echte testen worden CI-fixtures; de gate + fail-visible
  randen zijn onderdeel van de Definition of Done voor de rekenkern.
- **Houdt open**: het toevoegen van onafhankelijke referentiecases (optie B) en de exacte
  tolerantie per drempel. **Trigger om uit te breiden**: zodra echt testen een afwijking toont, of
  bij twijfel over een uitkomst van de oude tool → voeg een handmatig nagerekende referentiecase
  toe.
- **Openstaande input**: 2–3 echte testdatasets mét de huidige-tool-uitkomsten zijn nodig om de
  fixtures te maken (eigenaar levert aan).
