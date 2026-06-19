# ADR-0011: Analyse-uitbreiding — methodes, instellingen, uitleg

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0002

## Context

De drempelbepaling moet naar expert-niveau: meerdere methodes, instelbare parameters, en
transparantie over wat er berekend wordt — inclusief **uitleg in de app/output** en een link naar
meer informatie. De rekenkern (oracle, ADR-0002) blijft de basis; we generaliseren hem en maken
de keuzes zichtbaar.

## Beslissing

- **LT2-methode**: **Modified-Dmax standaard**, **Dmax** selecteerbaar. ModDmax = Dmax maar de lijn
  start bij het punt vlak vóór de eerste duidelijke lactaatstijging (>0,4 mmol/L t.o.v. de vorige
  stap).
- **OBLA-niveau** instelbaar (2/3/4 mmol/L; standaard 4,0).
- **LT1-delta** instelbaar (baseline + 0,5/1,0/1,5; standaard 1,0).
- **Polynoomgraad**: R²/AIC-advies, door de testleider te overrulen (auto/3/4).
- **Meetpunt uitsluiten** uit de fit (aparte slice C-outlier).
- **Hartslag**: optionele HF-kolom + HR bij de drempels (aparte slice C2).
- **Uitleg**: korte Nederlandse uitleg van LT1/LT2/OBLA/Dmax/ModDmax/R² in de output, met een
  "Meer informatie"-link (URL instelbaar; nu een algemene bron).

Defaults houden de oracle-uitkomst gelijk (ModDmax is een bewuste afwijking, expliciet gekozen).

## Gevolgen

**Positief:** expert-grade, transparant, instelbaar; uitleg verlaagt drempel/foutkans.
**Negatief / kosten:** meer UI-controls en meer testoppervlak; methodekeuze moet zichtbaar mee in
het latere rapport.

## Toekomstgevolgen

- **Legt vast**: methode-/parametriseerbare analyse met zichtbare keuze + uitleg.
- **Houdt open**: extra methodes (log-log, IAT) en de exacte "Meer informatie"-bron. **Trigger**:
  vraag uit de praktijk, of eigenaar levert een voorkeurslink/bron.
