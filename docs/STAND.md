# Stand van het project

> **Lopend overzicht — niet sessie-gebonden.** Dit is de eerste plek om te lezen bij elke nieuwe
> sessie (na [`CLAUDE.md`](../CLAUDE.md)). Houd 'm kort en actueel; werk 'm bij na elke
> merge/deploy of bij een pauze.

> **Laatst herzien**: 2026-06-19 — fundament compleet (ADR-0001 t/m 0005), slice 1 (rekenkern)
> gebouwd/getest, §11-muren live, én de deploy-pijplijn staat: elke merge naar `main` publiceert
> naar GitHub Pages. **Live: https://nolles15.github.io/lactaat-systeem/** (skelet).
>
> **▶️ HERVATTEN**: `main` is beschermd → élke wijziging gaat via een branch + PR + groene CI;
> merge = automatische deploy. Grafiek + drempels-slice is af en live (lactaatcurve, LT1/LT2/OBLA,
> R², fail-visible randen). Volgende UI-slice = **trainingszones** — die triggert de zone-model-keuze
> (briefing 3.5 vs simpel). Daarna PDF-export. Geparkeerde keuzes: zone-model, PDF-aanpak,
> chart lazy-loaden (bundel ~554 KB). Rekenkern-fixtures wachten op 2–3 echte testdatasets (ADR-0002).

## 1. Doel

Lactaattest-webapp voor de testleiders van het Hanze Inspanningslab (SportsFieldsLab Groningen).
Zet de bestaande single-file tool (LT1/LT2 via D-max, OBLA, polynoomfit, trainingszones) om naar
een webapp met deelnemer-/testhistorie, vergelijking en een PDF-rapport in Hanze-huisstijl —
zonder dat de app persoonsgegevens bewaart.

## 2. Wat staat er nu

- Startkit-documenten (CLAUDE.md, START.md, deze STAND, ADR-proces).
- ADR-0001 (privacy-architectuur) — Geaccepteerd.
- ADR-0002 (verificatiestrategie rekenkern) — Geaccepteerd.
- ADR-0003 (premisse en scope) — Geaccepteerd.
- ADR-0004 (stack: Vite + React + TypeScript) — Geaccepteerd.
- ADR-0005 (hosting/repo: GitHub publiek + Pages) — Geaccepteerd.
- ADR-0006 (UI-werkwijze: code-first + gecentraliseerd Hanze-thema) — Geaccepteerd.
- ADR-0007 (grafiek-library: Recharts v3) — Geaccepteerd.
- ADR-0008 (ruststap = baseline, niet in de fit) — Geaccepteerd.
- Briefing van het lab als fundament-context (bestaande logica, huisstijl, protocollen, types).
- **Slice 1**: Vite+React+TS skelet + getypte rekenkern (`src/lib/rekenkern.ts`) met 9 tests.
- **Muren live** (GitHub Actions): test-gate (build+tests) + secret-scan (gitleaks) + branch
  protection op `main` (strict, enforce_admins, PR vereist).
- Repo: https://github.com/Nolles15/lactaat-systeem (publiek).
- **Deploy-pijplijn live**: merge naar `main` → GitHub Pages. URL:
  https://nolles15.github.io/lactaat-systeem/
- **Header-slice**: Hanze-logo + huisstijl-thema (tokens in `src/index.css`), app-shell, titel
  gefixt. Scaffold-demo en ongebruikte assets verwijderd.
- **Invoerpaneel-slice**: meetpunten-tabel (intensiteit + lactaat), sport-toggle (fietsen=Watt /
  lopen=min/km → km/u via rekenkern), rij toevoegen/verwijderen, fail-visible validatie
  (`src/lib/invoer.ts` met 8 tests). State leeft in `App` voor de volgende slices.
  - Feedback verwerkt: vaste **ruststap** (intensiteit 0) bovenaan; bij lopen **pace én km/u** getoond.
- **Grafiek + drempels-slice**: `src/lib/analyse.ts` (polyfit + graadkeuze + R² + LT1/LT2/OBLA +
  fail-visible randen, 4 tests). Recharts v3-grafiek (curve, scatter, D-max-lijn, referentielijnen)
  + resultatentabel met waarschuwingen. Live.

## 3. Tech-stack — kort

- **Vite + React + TypeScript**, Recharts voor de grafiek (ADR-0004). Client-side, geen backend,
  statisch hostbaar (ADR-0001). Hosting-platform nog te kiezen.

## 4. Fundament-status (CLAUDE.md §1/§6)

- [x] Premisse vastgelegd (ADR-0003)
- [~] Monitoring / health-check — verkleind voor een statische app: deploy-status zichtbaar via
      Actions (faalt → geen deploy). Optioneel later een simpele uptime-check op de Pages-URL.
- [x] Verplichte CI-test-gate + branch protection = muur (§11) — live
- [x] Backups — belegd buiten de app: beheerde Hanze-schijf is system of record (ADR-0001)
- [x] Correctheid + fail-visible-strategie — ADR-0002 (oracle + zichtbare randen)
- [x] Verificatie-aanpak — ADR-0002: CI-fixtures uit echte testen; gate + branch protection
- [x] Privacy — ADR-0001: geen persoonsgegevens in de app, bestand-gebaseerd

## 5. Vervolg-prioriteiten

1. **Fundament afmaken**: intake stap 3 (correctheid + verificatie van de rekenlogica), git vanaf
   dag 0, stack-/hosting-ADR, CI-test-gate + branch protection + secret-scan (§11-muren).
2. **Opschoning/architectuur**: projectstructuur, JSON-schema (uit de TS-types), datamodel-ADR.
3. **Features (klein gefaseerd)**: invoer → rekenkern → grafiek → drempels → zones → export
   (JSON + PDF). Daarna V2 (deelnemersbeheer, CSV, HF/RPE, vergelijken).

## 6. Open beslissingen

- **Layout/prominentie review** — eigenaar heeft vragen over hoe prominent het invoerscherm komt;
  vormgeving bewust uitgesteld (ADR-0006 maakt restyle goedkoop). Logo + huisstijl: akkoord.
- **Chart lazy-loaden** — Recharts maakt de bundel ~554 KB; later code-splitten. Trigger: als
  laadtijd merkbaar wordt.
- **Zone-model** — de uitgebreide briefing-tabel 3.5 (A1/A2/A2+/B/C met −10% en midpoints) vs een
  simpeler model. Domeinkeuze met ADR. Trigger: vóór de zones-slice.
- **Recharts v2 vs v3** — v2 is end-of-life; v3 heeft API-wijzigingen. Trigger: bij de grafiek-slice.
- **PDF-aanpak** — client-side (jsPDF/html2canvas) vs anders. Trigger: bij de export-feature.
- **Tolerantie testfixtures** — hoe strak moeten de drempels matchen (ADR-0002). Trigger: bij het
  schrijven van de eerste fixture-tests.
- **Testfixtures aanleveren** — 2–3 echte testdatasets + huidige-tool-uitkomsten (ADR-0002).
  Trigger: nodig vóór de rekenkern "af" heet.
- **Auth / centrale opslag (V3)** — bewust uitgesteld; heroverweegt ADR-0001 indien nodig.
