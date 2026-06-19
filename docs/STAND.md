# Stand van het project

> **Lopend overzicht — niet sessie-gebonden.** Dit is de eerste plek om te lezen bij elke nieuwe
> sessie (na [`CLAUDE.md`](../CLAUDE.md)). Houd 'm kort en actueel; werk 'm bij na elke
> merge/deploy of bij een pauze.

> **Laatst herzien**: 2026-06-19 — fundament compleet (ADR-0001 t/m 0005), slice 1 (rekenkern)
> gebouwd/getest, §11-muren live, én de deploy-pijplijn staat: elke merge naar `main` publiceert
> naar GitHub Pages. **Live: https://nolles15.github.io/lactaat-systeem/** (skelet).
>
> **▶️ HERVATTEN**: `main` is beschermd → élke wijziging gaat via een branch + PR + groene CI;
> merge = automatische deploy. **Goedgekeurd plan loopt**: expert-niveau + top-tier layout
> (`.claude/plans/polished-napping-dream.md`), in slices A→D. **Slice A (eenheidsmodel) is af en
> live**: lopen-invoer = snelheid (km/u) met pace eronder; uitvoer pace-primair (ADR-0010).
> Volgende = **Slice B** (intake + in-sessie datamodel, verplichte naam, apparatuur-stub; ADR-0012).
> Geparkeerd tot na het datamodel/design: PDF-rapport en JSON-opslag (zie §6).

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
- ADR-0009 (zone-model: drempelzones + 5-zone) — Geaccepteerd.
- ADR-0010 (eenheidsmodel: snelheid invoer / pace uitvoer) — Geaccepteerd.
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
  + resultatentabel met waarschuwingen. Live. (Labels boven de lijn, gestaggerd.)
- **Trainingszones-slice**: `src/lib/zones.ts` (drempelzones + 5-zone, 3 tests); twee zonetabellen
  met intensiteitsgrenzen (Watt of pace+km/u). Live.
- **Slice A — eenheidsmodel** (ADR-0010): lopen-invoer = **snelheid (km/u)** met afgeleide pace;
  uitvoer pace-primair (grafiek-tooltip toont beide). `src/lib/invoer.ts` aangepast (25 tests). Live.

## 3. Tech-stack — kort

- **Vite + React + TypeScript**, Recharts v3 voor de grafiek (ADR-0004/0007). Client-side, geen
  backend, statisch (ADR-0001). Gehost op GitHub Pages, CI + muren op GitHub (ADR-0005).

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

Fundament + muren + deploy staan; de minimum-app (invoer → curve → drempels → zones) is live.
Resterend, bewust in deze volgorde:

1. **Design-/datamodel-ronde** (eigenaar): welke gegevens, layout, en wat er in het rapport hoort.
   Hier hangen PDF én persistence aan — daarom geparkeerd (zie §6).
2. **V2-velden die het datamodel stabiliseren**: deelnemergegevens, HF/RPE, CSV-import,
   vergelijken. Pas hierna is het datamodel rijp.
3. **PDF-export + JSON-opslag/inladen** — in één keer, op een stabiel datamodel (JSON mét
   `versie`-veld).
4. **Niet-gekoppelde polish** (mag tussendoor): tooltip opschonen, grafiek lazy-loaden.

## 6. Open beslissingen

- **Layout/prominentie review** — eigenaar heeft vragen over hoe prominent het invoerscherm komt;
  vormgeving bewust uitgesteld (ADR-0006 maakt restyle goedkoop). Logo + huisstijl: akkoord.
- **Chart lazy-loaden** — Recharts maakt de bundel ~554 KB; later code-splitten. Trigger: als
  laadtijd merkbaar wordt.
- **Tooltip opschonen** — toont soms een derde, verwarrende waarde (curve-overschot/extrapolatie).
  Trigger: bij een polish-ronde van de grafiek.
- **PDF-export — GEPARKEERD** tot een design-/inhoudsronde (welke gegevens, layout, branding;
  evt. via Claude Design). Meest ontwerp-afhankelijke deliverable → nu bouwen = weggegooid werk.
  Aanpak-opties besproken (jsPDF+html2canvas / jsPDF programmatisch / print-stylesheet); nog niet
  gekozen. Client-side verplicht (ADR-0001).
- **JSON-opslag/inladen — GEPARKEERD** tot het datamodel stabiel is. Reden: het bestandsformaat
  groeit mee met elke modelwijziging (deelnemer/HF/RPE…) → bouw het in één keer, **mét een
  `versie`-veld** zodat oude exports blijven werken. Past op de bestand-gebaseerde premisse (ADR-0001).
- **Tolerantie testfixtures** — hoe strak moeten de drempels matchen (ADR-0002). Trigger: bij het
  schrijven van de eerste fixture-tests.
- **Testfixtures aanleveren** — 2–3 echte testdatasets + huidige-tool-uitkomsten (ADR-0002).
  Trigger: nodig vóór de rekenkern "af" heet.
- **Auth / centrale opslag (V3)** — bewust uitgesteld; heroverweegt ADR-0001 indien nodig.
