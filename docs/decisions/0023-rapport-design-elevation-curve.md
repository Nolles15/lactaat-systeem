# ADR-0023: Rapport design-elevation — eigen interactieve lactaatcurve (custom SVG)

- **Status**: Geaccepteerd
- **Datum**: 2026-06-29
- **Bouwt voort op**: ADR-0019, ADR-0022
- **Raakt**: ADR-0007 (Recharts)

## Context

ADR-0022 leverde een functioneel rapport met de **generieke Recharts-curve**. Doel van de eigenaar:
een **cutting-edge, wereldklasse** rapport (stijlgids als springplank, niet als plafond). De
gewenste grafiek heeft een annotatielaag (drempellijnen + labels + een meebewegende "actieve
titel"), zone-banden, een **sleepbare scrubber** met live aflezing, en betekenisvolle motion. ADR-0007
koos Recharts en noemde als heroverweeg-trigger expliciet *"een grafiek-eis die Recharts niet goed
dekt"* — dit is die eis.

## Opties

- **A — Eigen inline-SVG grafiekcomponent** voor het rapport. *Voor:* volledige controle over
  annotatie, scrubber, zone-banden en motion; gevoed door `evalueerOpIntensiteit` (echte fit +
  geïnterpoleerde HR → **geen verzonnen data**); on-brand tot in de details. *Tegen:* een tweede
  grafiek-implementatie naast Recharts.
- **B — Recharts uitbreiden** met annotaties + scrubber. *Voor:* één library. *Tegen:* sleep-scrubber,
  precieze annotatie-badges en de draw-in-motion zijn omslachtig/beperkt in Recharts.
- **C — Niet eleveren.** *Tegen:* botst met het wereldklasse-doel.

## Beslissing

**Optie A.** `src/components/LactaatGrafiek.tsx` (+ `.css`):
- Oranje curve + area-fill, de **échte meetpunten** als open markers, **zone-banden** (kleur per
  zone), **gelabelde drempellijnen** (LT1/LT2/OBLA), en een **actieve titel** die meebeweegt met de
  scrubber ("Boven … stapelt je verzuring zich sneller op" / "… in balans").
- **Sleepbare scrubber** (pointer) **én** een toegankelijke range-slider; de **live readout**
  (intensiteit · lactaat · hartslag · zone) komt **uitsluitend** uit `evalueerOpIntensiteit`
  (ADR-0019) — geen ad-hoc formules (de fout die de mockup-jury in richting C ving).
- **Motion**: de curve tekent zichzelf bij verschijnen; respecteert `prefers-reduced-motion`.
- Vervangt de Recharts-curve **in het rapport**; het invoerscherm houdt `Grafiek` (Recharts).
- Geverifieerd met Playwright-screenshots (desktop/mobiel).

## Gevolgen

**Positief:** een distinctief, interactief én eerlijk kroonjuweel; on-brand; benut precies de
anti-fabricatie-bouwsteen uit het fundament. **Negatief / kosten:** twee grafiek-implementaties
(Recharts in het invoerscherm, eigen SVG in het rapport) — bewust, ze dienen verschillende doelen.

## Toekomstgevolgen

- **Legt vast**: het rapport gebruikt een **eigen SVG-grafiek**; de scrubber-aflezing loopt via het
  honest `evalueerOpIntensiteit`-primitief.
- **Houdt open**: sticky **scrollytelling**-opbouw, bredere motion-/typografie-polish over het hele
  rapport, en eventueel later ook het invoerscherm naar eigen SVG. **Trigger**: vervolg-elevation
  of een nieuwe grafiek-eis.
