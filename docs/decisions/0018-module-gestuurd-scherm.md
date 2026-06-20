# ADR-0018: Module-gestuurd scherm + gecombineerde conclusie

- **Status**: Geaccepteerd
- **Datum**: 2026-06-20
- **Bouwt voort op**: ADR-0014, ADR-0017

## Context

Met VO2max erbij stapelde alles op één scherm. De eigenaar wil dat het scherm **toont wat bij de
test hoort**: alleen lactaat, alleen VO2max, of beide — makkelijk te **splitsen** én te
**combineren**, en bij beide de **conclusies verbonden** (de drempels naast elkaar).

## Beslissing

- **Twee toggles** bovenaan (Lactaat / VO2max) bepalen welke modules actief zijn. Eén aan = die
  test; beide aan = gecombineerd. **CPET-import zet VO2max automatisch aan.**
- **`Sessie.actief`** (optioneel; afleidbaar via `actieveModules()`) scheidt *zichtbaarheid* van
  *data*: een module uitzetten **bewaart** de data (omkeerbaar).
- Het scherm rendert **module-gestuurde, dynamisch genummerde** secties: Intake (altijd) →
  (lactaat) Meetpunten / Curve & drempels / Zones → (vo2max) VO₂max → (beide + resultaten)
  **Gecombineerde conclusie**.
- **Gecombineerde conclusie**: een tabel die de aerobe (LT1 ↔ VT1) en anaerobe (LT2 ↔ VT2) drempels
  van beide testen naast elkaar zet (intensiteit + HR), zodat de conclusies verbonden zijn.

## Gevolgen

**Positief:** één scherm voor elke testsoort; rustig en relevant; de basis voor het latere
combinatierapport (B.3/B.4). **Negatief / kosten:** vaste sectie-nummers (ADR-0013) worden nu
dynamisch berekend.

## Toekomstgevolgen

- **Legt vast**: zichtbaarheid via `actief`-vlaggen; dynamische sectie-opbouw; LT↔VT-koppeling.
- **Houdt open**: het echte **combinatierapport** (PDF) en de tijd-/belasting-uitlijning van de
  ruwe data (B.4). **Trigger**: rapport-voorbeeld / echte combinatietest.
