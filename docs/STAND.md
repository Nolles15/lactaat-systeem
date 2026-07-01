# Stand van het project

> **Lopend overzicht — niet sessie-gebonden.** Dit is de eerste plek om te lezen bij elke nieuwe
> sessie (na [`CLAUDE.md`](../CLAUDE.md)). Houd 'm kort en actueel; werk 'm bij na elke
> merge/deploy of bij een pauze.

> **Laatst herzien**: 2026-06-20 — modulair lab-platform (plan v3). **Deel A compleet**; **Deel B
> gestart**: VO2max-import uit Cortex MetaSoft werkt (geverifieerd tegen echte data).
> https://nolles15.github.io/lactaat-systeem/. 52 tests groen.
>
> **▶️ HERVATTEN**: `main` is beschermd → branch + PR + groene CI; merge = auto-deploy. Koers:
> **modulair lab-platform** — een test levert óf lactaat, óf VO2max, óf beide
> (`.claude/plans/polished-napping-dream.md`). Deel A ✓. **Deel B**: B.0 .gitignore lab-exports ✓ ·
> B.1+B.2 vo2max-module + **Cortex-parser** + import-UI ✓ (ADR-0017) · **B.3a module-gestuurd scherm**
> ✓ (twee toggles Lactaat/VO2max; dynamische secties; gecombineerde conclusie LT1↔VT1 / LT2↔VT2;
> ADR-0018). **B.3 rapport-systeem — ontwerp-discovery LOOPT, GEPAUZEERD** (eigenaar legt voor aan
> collega's vóór de richtingkeuze). Nog géén code; eerst ontwerp. Procesplan + werkdocumenten staan
> lokaal in `.claude/plans/` (niet in repo): `distributed-crunching-spring.md` (proces),
> `rapport-eisen.md`, `rapport-benchmark.md`, `rapport-fase3-jury.md`, en `mockups/` (A Cockpit /
> B Reisverhaal / C Speeltuin). Fase 0–3 klaar (eisen + multi-agent benchmark + 3 mockups + jury).
> **Richting gekozen** (combi B+C; ADR-0022 volgt bij de bouw van `Rapport.tsx`). **Online-plan
> ligt er** (`.claude/plans/distributed-crunching-spring.md`): invoering→uitvoer→delen, slices.
> Geshipt: **Slice 3b** Playwright visuele-check ✓ #29; **Slice 1** Hanze Design System ✓ ADR-0020;
> **Slice 2** `rapporttekst.ts` (templates, geen AI) ✓ ADR-0021; **Slice 3** `Rapport.tsx`
> (functioneel rapport, module-gestuurd, screenshot-geverifieerd) ✓ ADR-0022; **Slice 3c**
> design-elevation — eigen interactieve SVG-lactaatcurve (annotatie + sleepbare scrubber + actieve
> titel + draw-in motion, gevoed door `evalueerOpIntensiteit`) ✓ ADR-0023; **Slice 5 (Route A)**
> sporter-viewer op `?rapport` (kale alleen-lezen pagina, laadt JSON → rapport; deel-hint in de app)
> ✓ ADR-0024; **Slice 3d DE REIS** sticky-graphic scrollytelling (curve blijft staan + bouwt zich
> op: curve→LT1→LT2→zones; scrubber verhuisd naar "Verken je eigen curve") ✓ ADR-0025;
> **reis-verbetering** — heldere herstructurering (primer "Over deze test" → reis → "De cijfers op
> een rij" → ademgas → vergelijken → verken), ontdubbeld, rijkere reis-teksten, minder witruimte.
> **Klikbare jargon-uitleg** ✓ ADR-0026 (`Term`-component + lab-beheerde `WOORDENLIJST`; toegepast op
> hero-kerngetallen + VT1/VT2). **Rapport-teksten geredigeerd** (eigenaar leverde `rapport-teksten-
> INGEVULD.md`; batch toegepast: "verzuring"→"lactaat", accuratere lactaat-uitleg, OBLA-tekst herzien,
> zone-betekenissen, VT-labels voluit, ademgas gelijkwaardig i.p.v. "ter info", ademgas-primaire
> samenvatting). **Nog open (eigenaar):** exacte disclaimer-tekst #49 + afzendernaam #50; plek voor
> OBLA in het rapport (tekst klaar, nog niet in beeld); eigen lay-out voor een **alleen-ademgas**-
> rapport (nu mager: geen reis/cijfers). Volgende =
> **Slice 4** PDF (met statische reis-variant) of **Slice 5b** self-contained HTML-export. Advies: A-basis + C-interacties op de echte
> fit. **Achtergrond (richting-agnostisch, gemerged via PR):** `src/lib/rapportmodel.ts` —
> single source of truth + `evalueerOpIntensiteit` (anti-fabricatie), ADR-0019. Daarna
> **B.4 combinatie-uitlijning** (na echte combi-data). ⚠️ Lab-exports (`docs/*.xml`)
> staan in `.gitignore` — gebruik met toestemming, nooit naar git.

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
- ADR-0012 (in-sessie datamodel + intake) — Geaccepteerd.
- ADR-0011 (analyse-uitbreiding: methodes/instellingen/uitleg) — Geaccepteerd.
- ADR-0013 (layout-herontwerp: gepolijste één-koloms cockpit) — Geaccepteerd.
- ADR-0014 (datamodel-evolutie: sessie met test-modules) — Geaccepteerd.
- ADR-0015 (sporter-facing zones: HR-bereik + W/kg) — Geaccepteerd.
- ADR-0016 (JSON opslaan/inladen: versioned, bestand-gebaseerd) — Geaccepteerd.
- ADR-0017 (VO2max-module + Cortex-import, beautify) — Geaccepteerd.
- ADR-0018 (module-gestuurd scherm + gecombineerde conclusie) — Geaccepteerd.
- ADR-0019 (rapport-model: één afgeleide single source of truth, anti-fabricatie) — Geaccepteerd.
- ADR-0020 (Hanze Design System adoptie: tokens, scherpe vormtaal, SVG-logo) — Geaccepteerd.
- ADR-0021 (rapport-teksten via deterministische templates, geen AI) — Geaccepteerd.
- ADR-0022 (rapport-scherm: gekozen combi-richting, module-gestuurd, geen advies) — Geaccepteerd.
- ADR-0023 (rapport design-elevation: eigen interactieve SVG-lactaatcurve) — Geaccepteerd.
- ADR-0024 (sporter-viewer: kale alleen-lezen rapportpagina op ?rapport, delen Route A) — Geaccepteerd.
- ADR-0025 (de reis: sticky-graphic scrollytelling als opening van het rapport) — Geaccepteerd.
- ADR-0026 (klikbare jargon-uitleg via lab-beheerde woordenlijst) — Geaccepteerd.
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
- **Slice B — intake + datamodel** (ADR-0012): `Intake.tsx` (naam* + testdatum + geb./geslacht +
  gewicht + testleider + notities + apparatuur-auto), `src/lib/sessie.ts` + `apparatuur.ts` (stub),
  in-sessie state in `App`. 29 tests. Live.
- **Slice C1 — analyse-methodes** (ADR-0011): `analyse.ts` met config (Mod)Dmax / OBLA-niveau /
  LT1-delta / graad+AIC; `AnalyseControls.tsx`; `uitleg.ts` (uitleg-blok + MEER_INFO_URL, nu
  algemene bron — vervangbaar). 32 tests. Live.
- **Slice C2 — hartslag**: optionele HF-kolom per meetstap; HR bij LT1/LT2/OBLA geïnterpoleerd
  (`interpoleerOpX`), HR-kolom in de resultaten (alleen als HF ingevuld). 34 tests. Live.
- **Slice C-outlier**: toggle "In fit" per meetstap; uitgesloten punten tellen niet in de fit maar
  blijven zichtbaar (open marker) — `analyse.uitgeslotenPunten`. 35 tests. Live. (Slice C compleet.)
- **Slice D — layout-herontwerp** (ADR-0013): gepolijste één-koloms cockpit; App bezit de genummerde
  sectie-koppen (1 Intake → 2 Meetpunten → 3 Analyse → 4 Zones), componenten leveren inhoud;
  kaarten + Hanze-accent-badges. Live.
- **Deel A — modulair lab-platform (plan v3)**: A.1 `Sessie` met modules (ADR-0014) · A.2 zones in
  HR + W/kg (ADR-0015) · A.3 RPE · A.4 JSON opslaan/inladen (ADR-0016, `src/lib/opslag.ts`). Live.
- **Deel B.1+B.2 — VO2max-import** (ADR-0017): `modules.vo2max` (beautified), `src/lib/cortex.ts`
  (SpreadsheetML-parser, adapter-patroon) + import-knop + VO2max-paneel. SESSIE_VERSIE→2 (lenient).
  Geverifieerd tegen het echte Cortex-bestand. Live.
- **Deel B.3a — module-gestuurd scherm** (ADR-0018): twee toggles (Lactaat/VO2max); secties
  dynamisch genummerd en alleen getoond wat actief is; `Combinatie.tsx` (LT1↔VT1 / LT2↔VT2).
  `Sessie.actief` scheidt zichtbaarheid van data. 54 tests. Live.

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
5. **Toekomstige scope (geparkeerd): VO2max-test + combinatierapport** — grote uitbreiding, alleen
   op expliciet besluit van de eigenaar. Zie §6.

## 6. Open beslissingen

- **VO2max-test + combinatierapport — TOEKOMSTIGE SCOPE (geparkeerd; eigenaar beslist).** Het lab
  combineert de lactaattest soms met een VO2max-test (eerder als losse tool geprobeerd). Wens: later
  onderzoeken of deze app ook de VO2max-test ondersteunt, en bij een combinatietest één
  **gecombineerd rapport** maakt. Groot: VO2max is een ander datatype (gaswisseling — VO2/VCO2/VE,
  RER, ventilatoire drempels VT1/VT2, VO2max-waarde), dus het sessiemodel (ADR-0012) en het rapport
  moeten een **tweede testtype** aankunnen. **Niet nu bouwen** — bij oppakken: eigen planronde +
  ADR('s).
- **Layout/prominentie review** — eigenaar heeft vragen over hoe prominent het invoerscherm komt;
  vormgeving bewust uitgesteld (ADR-0006 maakt restyle goedkoop). Logo + huisstijl: akkoord.
- **Chart lazy-loaden** — Recharts maakt de bundel ~554 KB; later code-splitten. Trigger: als
  laadtijd merkbaar wordt.
- **Tooltip opschonen** — toont soms een derde, verwarrende waarde (curve-overschot/extrapolatie).
  Trigger: bij een polish-ronde van de grafiek.
- **Rapport (web + PDF) — ONTWERP-DISCOVERY LOOPT** (B.3, zie HERVATTEN). Eisen opgehaald: doel
  sporter+coach, web + PDF (beide, client-side, geen nieuwe opslag), kern+verdieping, performance-
  toon, Hanze-basis-vrij. Benchmark + 3 mockups + jury klaar. Fundament-laag `rapportmodel.ts`
  gebouwd (ADR-0019, richting-agnostisch). Hanze Design System geadopteerd (ADR-0020). **Open**:
  (1) rapport-ontwerprichting vastleggen bij de bouw → ADR-0022; (2) rendering-techniek nog niet
  gekozen (jsPDF+html2canvas / jsPDF programmatisch /
  print-stylesheet) → Fase 6-ADR; (3) grafiek-tech voor het rapport: Recharts v3 (ADR-0007) vs
  eigen SVG — annotatielaag/scrubber/combi-overlay kunnen 0007's trigger raken. Client-side
  verplicht (ADR-0001).
- **JSON-opslag/inladen — GEPARKEERD** tot het datamodel stabiel is. Reden: het bestandsformaat
  groeit mee met elke modelwijziging (deelnemer/HF/RPE…) → bouw het in één keer, **mét een
  `versie`-veld** zodat oude exports blijven werken. Past op de bestand-gebaseerde premisse (ADR-0001).
- **Tolerantie testfixtures** — hoe strak moeten de drempels matchen (ADR-0002). Trigger: bij het
  schrijven van de eerste fixture-tests.
- **Testfixtures aanleveren** — 2–3 echte testdatasets + huidige-tool-uitkomsten (ADR-0002).
  Trigger: nodig vóór de rekenkern "af" heet.
- **Auth / centrale opslag (V3)** — bewust uitgesteld; heroverweegt ADR-0001 indien nodig.
