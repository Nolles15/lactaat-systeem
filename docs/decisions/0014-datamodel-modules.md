# ADR-0014: Datamodel-evolutie — sessie met test-modules

- **Status**: Geaccepteerd
- **Datum**: 2026-06-20
- **Bouwt voort op**: ADR-0012

## Context

De bekrachtigde koers is een **modulair lab-platform**: een test levert óf lactaat, óf VO2max, óf
beide (gecombineerd). Vóór we opslag en het rapport bouwen, hebben we één datamodel nodig dat dit
mogelijk maakt zonder herbouw. Het huidige model (ADR-0012) is lactaat-specifiek en plat in
App-state.

## Beslissing

Eén **`Sessie`** met een **modules-map**:

```
Sessie {
  versie: number          // SESSIE_VERSIE, voor store-ready JSON later
  deelnemer { naam*, geboortedatum?, geslacht?, gewichtKg? }
  test { datum, sport, testleider?, notities? }   // apparatuur blijft afgeleid
  modules { lactaat? { rust, meetpunten[], analyseConfig } /*, vo2max? later */ }
}
```

- **Nu alleen `lactaat` gevuld**; de vorm anticipeert VO2max (alleen de container, geen
  speculatieve VO2max-logica — YAGNI).
- **In-sessie** in React-state, niets opgeslagen (ADR-0001/0012). `versie` maakt latere JSON
  store-ready.
- De data-types (`Rij`/meetpunten) verhuizen van de component naar `src/lib/sessie.ts` (lib bezit
  het model; componenten consumeren het).

## Gevolgen

**Positief:** één bron van waarheid; "óf/óf/allebei" wordt mogelijk; opslag en het (combinatie)-
rapport kunnen straks op dit model bouwen. **Negatief / kosten:** eenmalige, gedrag-neutrale
refactor van App-state (de 35 bestaande tests blijven groen).

## Toekomstgevolgen

- **Legt vast**: sessie-met-modules als model; `versie`-veld.
- **Houdt open**: `modules.vo2max` (Deel B) en JSON-persistence — beide schuiven hierop in.
  **Trigger**: slice A.4 (JSON) en de VO2max-ronde (Deel B).
