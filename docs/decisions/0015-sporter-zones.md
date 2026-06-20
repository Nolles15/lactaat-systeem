# ADR-0015: Sporter-facing zones — HR-bereik + W/kg

- **Status**: Geaccepteerd
- **Datum**: 2026-06-20
- **Bouwt voort op**: ADR-0009

## Context

De uitvoer is sporter/coach-facing. Naast de intensiteit (Watt of pace/snelheid) willen sporters
hun zones ook in **hartslag** en — bij fietsen — in **vermogen per kg (W/kg)** zien. We hebben de
bouwstenen al: HR per stap (HF-kolom) en het gewicht (intake).

## Beslissing

- **HR-bereik per zone**: interpoleer de hartslag op de zonegrenzen via `interpoleerOpX`
  (`analyse.ts`) over de stappen met een HF-waarde. Toon een HR-kolom in de zonetabellen, **alleen
  als** er HF is ingevoerd.
- **W/kg**: bij fietsen toont `formatIntensiteit` naast Watt ook W/kg, **alleen als** een
  lichaamsgewicht is ingevuld. Dit verschijnt overal waar intensiteit wordt getoond (drempels én
  zones), uniform.
- Bij lopen blijft het pace + snelheid (geen W/kg).

## Gevolgen

**Positief:** zones in HR + pace/snelheid + vermogen/W·kg — precies de sporter-facing afgifte.
**Negatief / kosten:** HR op zonegrenzen buiten het meetbereik kan ontbreken (open grens) — dan
tonen we die grens open; HR blijft aanvullend.

## Toekomstgevolgen

- **Legt vast**: HR-/W·kg-verrijking van de bestaande zones (ADR-0009).
- **Houdt open**: %HRmax-zones of HR-reserve later (vereist HRmax). **Trigger**: vraag uit de praktijk.
