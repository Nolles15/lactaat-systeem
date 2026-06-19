# Stand van het project

> **Lopend overzicht — niet sessie-gebonden.** Dit is de eerste plek om te lezen bij elke nieuwe
> sessie (na [`CLAUDE.md`](../CLAUDE.md)). Houd 'm kort en actueel; werk 'm bij na elke
> merge/deploy of bij een pauze.

> **Laatst herzien**: 2026-06-19 — fundament-intake gestart. Premisse scherp, scope vastgelegd
> (alleen lab-testleiders), en de eerste fundamentkeuze gemaakt: ADR-0001 (privacy) = geen
> persoonsgegevens in de app, bestand-gebaseerd.
>
> **▶️ HERVATTEN**: nog geen code. Volgende stap = intake afmaken (correctheid/verificatie) en de
> stack-/hosting-ADR (volgt uit ADR-0001: client-side, statisch). Git is nog niet geïnitialiseerd
> (dag-0-taak, §9). Lees eerst [`docs/decisions/0001-privacy-architectuur.md`](./decisions/0001-privacy-architectuur.md).

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
- Briefing van het lab als fundament-context (bestaande logica, huisstijl, protocollen, types).
- **Nog geen applicatiecode.**

## 3. Tech-stack — kort

- **Vite + React + TypeScript**, Recharts voor de grafiek (ADR-0004). Client-side, geen backend,
  statisch hostbaar (ADR-0001). Hosting-platform nog te kiezen.

## 4. Fundament-status (CLAUDE.md §1/§6)

- [x] Premisse vastgelegd (ADR-0003)
- [ ] Monitoring / health-check
- [ ] Verplichte CI-test-gate (+ branch protection = muur, §11)
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

- **Hosting & repo-remote** — waar host je de statische app, en waar leeft de repo (GitHub/GitLab)
  — dat bepaalt waar de §11-muren (branch protection, secret-scan, CI-gate) komen. Trigger: nu.
- **PDF-aanpak** — client-side (jsPDF/html2canvas) vs anders. Trigger: bij de export-feature.
- **Testfixtures aanleveren** — 2–3 echte testdatasets + huidige-tool-uitkomsten (ADR-0002).
  Trigger: nodig vóór de rekenkern "af" heet.
- **Auth / centrale opslag (V3)** — bewust uitgesteld; heroverweegt ADR-0001 indien nodig.
