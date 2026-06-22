# ADR-0019: Rapport-model — één afgeleide structuur als single source of truth

- **Status**: Geaccepteerd
- **Datum**: 2026-06-22
- **Bouwt voort op**: ADR-0002, ADR-0014, ADR-0018

## Context

Het rapport-systeem (B.3) komt eraan: een weergave van de testresultaten als **webscherm én
PDF**, in een ontwerprichting die nog gekozen wordt (Fase 4). Uit de mockup-jury kwam een concrete
waarschuwing: de meest interactieve richting (C) toonde **verzonnen waarden** uit ad-hoc
JS-formules — bij 340 W las de curve ~5,8 mmol/L af terwijl de meting 11,5 was. Dat is precies de
"stil fout op een fragiel fundament"-valkuil (CLAUDE.md §1): een rapport dat een ander getal toont
dan de rekenkern berekent.

Elke denkbare rapport-richting heeft dezelfde **afgeleide feiten** nodig (deelnemer + leeftijd,
drempels met intensiteit/HR/RPE, zones met HR-bereik, VO2max, LT↔VT-koppeling, R²/betrouwbaarheid).
De vraag: waar leiden we die af?

## Opties

- **A — Eén rapport-model.** Een pure functie `bouwRapportModel(sessie) → RapportModel` brengt alle
  al-berekende feiten samen tot één render-klare, getypte structuur; componenten renderen alleen.
  Plus `evalueerOpIntensiteit(model, x)` als eerlijke aflezing voor een interactieve scrubber.
  *Voor:* één waarheid, correctheid-eerst, herbruikbaar over álle richtingen, los testbaar,
  ontkoppeld van de nog-open visuele keuze. *Tegen:* een extra laag; moet meegroeien met nieuwe
  afgeleide velden.
- **B — Elke component leidt zelf af** (zoals de mockups deden). *Voor:* geen extra laag. *Tegen:*
  meerdere waarheden → exact de fabricatie-/inconsistentiebug die de jury ving; niet testbaar als
  geheel.
- **C — Wachten tot de richting gekozen is.** *Voor:* niets vooruit bouwen. *Tegen:* het fundament
  (dat richting-agnostisch is) blijft liggen terwijl het nu al veilig kan; tegen fundament-eerst.

## Beslissing

**Optie A.** `src/lib/rapportmodel.ts`:
- `bouwRapportModel(sessie)` — pure functie, geen IO en geen systeemklok; hergebruikt de bestaande
  rekenkern (`analyseer`, `zones`, `interpoleerOpX`) en invoer-helpers. Leeftijd wordt afgeleid uit
  geboortedatum + **testdatum** (niet de actuele datum). Fail-visible meldingen op modelniveau
  (ontbrekende naam, actieve-maar-lege module) naast de bestaande analyse-waarschuwingen (ADR-0002).
- De rij→stap-mapping is ontdubbeld naar `stappenUitRijen()` in `invoer.ts`, gedeeld door het
  invoerscherm (`App.tsx`) en het model — één mapping, geen drift.
- `evalueerOpIntensiteit(model, x)` leest lactaat uit de **échte gefitte curve** (geen extrapolatie
  buiten het testbereik) en HR uit de **échte meetpunten**. Bewust **geen VO2-per-Watt**: die
  koppeling bestaat niet in de data, dus elke waarde zou verzonnen zijn — liever niets dan een
  schijngetal.

## Gevolgen

**Positief:** het rapport toont nooit een ander getal dan de rekenkern; één testbare waarheid
(14 nieuwe tests); werkt voor elke richting (A/B/C) én voor zowel web als PDF; de scrubber-bouwsteen
is correct-by-design. **Negatief / kosten:** een extra afgeleide laag die moet meegroeien als de
gekozen richting nieuwe velden vraagt; lichte indirectie tussen sessie en weergave.

## Toekomstgevolgen

- **Legt vast**: rapport-weergaven lezen uit `RapportModel`, niet uit eigen berekeningen;
  `evalueerOpIntensiteit` geeft geen niet-afleidbare waarden terug (anti-fabricatie als principe).
- **Houdt open**: extra afgeleide velden zoals **atleettype/limiter-duiding en
  auto-conclusiezinnen** — bewust **nog niet** gebouwd; die vergen domeinvalidatie door de eigenaar
  en mogen niet schijnprecies worden. Ook de visuele ontwerprichting (Fase 4 → ADR-0020) en de
  rendering-techniek (web/PDF; latere ADR) blijven open. **Trigger**: de richtingkeuze in Fase 4.
