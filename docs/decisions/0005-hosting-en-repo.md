# ADR-0005: Hosting en repo-remote — GitHub (publiek) + GitHub Pages

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19
- **Bouwt voort op**: ADR-0001, ADR-0004

## Context

De §11-muren (branch protection, CI-test-gate, secret-scan) hebben een remote nodig om afgedwongen
te worden. De app is statisch en client-side; de host ziet geen persoonsgegevens (ADR-0001). Er is
een GitHub-account beschikbaar (`Nolles15`, al ingelogd via `gh`).

## Opties

- **A — GitHub + statische host.** Repo + Actions (CI) + branch protection + secret-scan op één
  plek; statische host deployt automatisch. *Voor:* gratis, muren first-class, snelste pad.
- **B — Hanze-infra (GitLab / eigen hosting).** Governance op institutionele infra, maar meer
  opzetwerk en afhankelijk van wat beschikbaar is.
- **C — Lokaal, remote later.** Sneller starten, maar muren staan nog niet.

## Beslissing

**Optie A**, concreet:

- **Repo**: **publiek** op GitHub (`Nolles15`). Publiek gekozen omdat er geen secrets of
  persoonsgegevens in de repo komen (ADR-0001, §9) en branch protection dan **gratis** een muur is.
- **CI**: GitHub Actions draait de test-gate (de fixtures uit ADR-0002).
- **Muur 1 — branch protection** op `main`: merge geblokkeerd tot de CI-check groen is (§11).
- **Muur 2 — secret-scan** in CI: merge hard geblokkeerd zodra er een sleutel in een commit zit.
- **Host**: **GitHub Pages** (één leverancier, gratis, geen extra account). Vercel/Cloudflare Pages
  zijn triviaal-omkeerbare alternatieven als een custom domain of betere DX dat later vraagt.

## Gevolgen

**Positief:** muren kosten niets en staan vanaf het begin goed; alles op één platform; statische
deploy zonder serverbeheer. **Negatief / kosten:**

- De **broncode is publiek leesbaar** — institutioneel akkoord bevonden voor deze niet-gevoelige
  tool.
- **Testfixtures moeten geanonimiseerd** de repo in: alleen kale meetgetallen (intensiteit,
  lactaat, HF/RPE) + verwachte drempels, nooit naam/geboortedatum/PAR-Q+. Dit is de brug tussen
  ADR-0002 (fixtures) en de publieke repo; echte deelnemerdata blijft buiten git (ADR-0001).

## Toekomstgevolgen

- **Legt vast**: GitHub (publiek) als thuisbasis en plek van de muren; GitHub Pages als host;
  fixtures uitsluitend geanonimiseerd in git.
- **Houdt open**: de exacte statische host (reversibel), een custom domain, en een eventuele
  overstap naar een privé/Hanze-repo (vereist dan een plan of andere muur-oplossing). **Trigger**:
  custom-domain-wens, of institutionele eis om de code besloten te maken.
