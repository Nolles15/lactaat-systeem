# Stand van het project

> **Lopend overzicht — niet sessie-gebonden.** Dit is de eerste plek om te lezen bij elke nieuwe
> sessie (na [`CLAUDE.md`](../CLAUDE.md)). Houd 'm kort en actueel; werk 'm bij na elke
> merge/deploy of bij een pauze.

> **Laatst herzien**: 2026-06-19 — fundament compleet (ADR-0001 t/m 0005), slice 1 (rekenkern)
> gebouwd en getest, en de §11-muren staan live op GitHub: CI-test-gate + secret-scan + branch
> protection (incl. enforce_admins). Repo: https://github.com/Nolles15/lactaat-systeem.
>
> **▶️ HERVATTEN**: `main` is beschermd → élke wijziging gaat via een branch + PR + groene CI.
> Volgende stap = UI-slices (header+logo → invoerpaneel → grafiek → drempels → zones → PDF).
> Eerst nog twee kleine beslissingen openzetten: het zone-model (briefing 3.5 vs simpel) en
> Recharts v2 vs v3. Rekenkern-fixtures wachten op 2–3 echte testdatasets (ADR-0002).

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
- Briefing van het lab als fundament-context (bestaande logica, huisstijl, protocollen, types).
- **Slice 1**: Vite+React+TS skelet + getypte rekenkern (`src/lib/rekenkern.ts`) met 9 tests.
- **Muren live** (GitHub Actions): test-gate (build+tests) + secret-scan (gitleaks) + branch
  protection op `main` (strict, enforce_admins, PR vereist).
- Repo: https://github.com/Nolles15/lactaat-systeem (publiek).

## 3. Tech-stack — kort

- **Vite + React + TypeScript**, Recharts voor de grafiek (ADR-0004). Client-side, geen backend,
  statisch hostbaar (ADR-0001). Hosting-platform nog te kiezen.

## 4. Fundament-status (CLAUDE.md §1/§6)

- [x] Premisse vastgelegd (ADR-0003)
- [ ] Monitoring / health-check — verkleind voor een statische app: deploy-status (Actions) +
      later een simpele check dat de Pages-URL laadt. Nog te regelen bij de deploy.
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

- **Zone-model** — de uitgebreide briefing-tabel 3.5 (A1/A2/A2+/B/C met −10% en midpoints) vs een
  simpeler model. Domeinkeuze met ADR. Trigger: vóór de zones-slice.
- **Recharts v2 vs v3** — v2 is end-of-life; v3 heeft API-wijzigingen. Trigger: bij de grafiek-slice.
- **PDF-aanpak** — client-side (jsPDF/html2canvas) vs anders. Trigger: bij de export-feature.
- **Tolerantie testfixtures** — hoe strak moeten de drempels matchen (ADR-0002). Trigger: bij het
  schrijven van de eerste fixture-tests.
- **Testfixtures aanleveren** — 2–3 echte testdatasets + huidige-tool-uitkomsten (ADR-0002).
  Trigger: nodig vóór de rekenkern "af" heet.
- **Auth / centrale opslag (V3)** — bewust uitgesteld; heroverweegt ADR-0001 indien nodig.
