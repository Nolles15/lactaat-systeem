# ADR-0007: Grafiek-library — Recharts v3

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0004

## Context

De lactaatcurve vereist scatter-punten, een gefitte polynoomcurve, referentielijnen (LT1/LT2/OBLA)
en een D-max-lijn. ADR-0004 noemde Recharts. De geïnstalleerde v2 (2.15.x) is end-of-life en minder
soepel met React 19; er is nog géén grafiekcode geschreven.

## Opties

- **A — Recharts v3.** Actueel/onderhouden, officiële React 19-support. Geen migratiekosten nu
  (geen grafiekcode). De briefing-voorbeelden zijn v2-API, maar de componenten bestaan ook in v3.
- **B — Recharts v2.** Exact de briefing-API, maar end-of-life → latere migratie alsnog nodig.
- **C — Andere lib** (visx/nivo/eigen SVG). Heropent een keuze zonder concrete aanleiding.

## Beslissing

**Optie A — Recharts v3** (`^3`). We schrijven de grafiek meteen op v3.

## Gevolgen

**Positief:** onderhouden, React 19-proof, geen latere migratie. **Negatief / kosten:** de
briefing-snippets moeten licht worden aangepast naar de v3-API.

## Toekomstgevolgen

- **Legt vast**: Recharts v3 als grafiek-library.
- **Houdt open**: een andere visualisatie als de eisen later groeien (bijv. CI-band). **Trigger**:
  een grafiek-eis die Recharts niet goed dekt.
