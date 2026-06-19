# ADR-0001: Privacy-architectuur — geen persoonsgegevens in de app

- **Status**: Geaccepteerd
- **Datum**: 2026-06-19

## Context

De lactaattest-webapp van het Hanze Inspanningslab verwerkt **bijzondere categorie
persoonsgegevens**: naam, geboortedatum en geslacht van sporters, en — via PAR-Q+ — medische
gegevens. Onder de AVG is dat het zwaarste regime.

Scope van v1 (vastgelegd): **alleen testleiders van het lab** gebruiken de app; sporters krijgen
geen account. De testleider voert echte namen in en wil per sporter een testhistorie kunnen
opbouwen en twee testen vergelijken.

De kernvraag is wáár die gezondheidsdata leeft. De eigenaar koos bewust voor de
privacy-minimaliserende route: de app bewaart zelf niets; data leeft in een bestand dat het lab
beheert.

## Opties

- **A — Bestand-gebaseerd, niets op server.** Volledig client-side app. Per deelnemer één
  JSON-bestand met testhistorie + PAR-Q+, bewaard door de testleider op de beheerde Hanze-schijf
  (OneDrive-Hanze: EU, back-up, governance al geregeld). In-/uitladen per sessie.
  *Voor:* kleinste AVG-last, geen centrale gezondheidsdatabase, geen verwerkersovereenkomst,
  kleinste lek-impact, simpelste (statische) hosting. *Tegen:* testleider beheert bestanden zelf;
  vergelijken vereist het juiste bestand inladen; geen automatische centrale historie.
- **B — Browser-lokaal (localStorage/IndexedDB).** *Voor:* geen handmatige bestanden. *Tegen:*
  gebonden aan één browser/apparaat, géén back-up, cache legen = stil dataverlies, lastig delen.
  Voor gezondheidsdata fragiel.
- **C — Centrale EU-database.** *Voor:* automatische historie, multi-testleider, makkelijk
  vergelijken. *Tegen:* centrale opslag van bijzondere-categorie data → zwaarste AVG-regime
  (grondslag, beveiliging, bewaartermijn, betrokkenenrechten, mogelijk DPIA + verwerkers-
  overeenkomst).

## Beslissing

**Optie A.** De app draait volledig client-side en bewaart **geen** persoonsgegevens — niet op een
server en ook niet automatisch in de browser (geen localStorage/IndexedDB voor persoonsdata).

Concreet:
- Namen en testdata leven **alleen in het werkgeheugen van de sessie**.
- Ze verlaten de sessie uitsluitend via een **bewuste, door de testleider gestarte export**:
  - een **JSON-bestand** per deelnemer (herinleesbaar, accumuleert de testhistorie), en
  - een **PDF-rapport** (Hanze-huisstijl).
- Een nieuwe of vervolgsessie begint met het **inladen** van het JSON-bestand.
- De **beheerde Hanze-schijf is het systeem van vastlegging** (system of record), niet de app.
- Sluit de testleider de tab zonder export, dan is de sessiedata weg — dat is by design, en de
  app waarschuwt vóór dataverlies (fail-visible).

## Gevolgen

**Positief:** de app/host is geen verwerker van gezondheidsdata; minimale AVG-last; kleinste
denkbare lek-impact; geen database, auth-server of verwerkersovereenkomst nodig voor v1; de
load-/concurrency-vraag vervalt grotendeels (geen gedeelde serverstaat).

**Negatief / kosten:** bestand-discipline ligt bij de testleider (kwijt bestand = kwijt historie);
vergelijken en historie vragen handmatig de juiste file; back-up leunt op de governance van de
Hanze-schijf, niet op de app.

## Toekomstgevolgen

- **Legt vast**:
  - De app slaat geen persoonsgegevens op; persistentie verloopt via expliciete bestand-export/
    -import. Dit is een **muur** (CLAUDE.md §11): er is geen opslag-codepad dat persoonsdata
    achterlaat, dus het kán niet stil misgaan.
  - Pre-shapet de stack-keuze (volgende ADR): de app moet **client-side** kunnen draaien; een
    backend is voor v1 niet nodig.
  - Hosting kan statisch (geen server-side persoonsdata).
- **Houdt open**:
  - Een latere, **opt-in** centrale opslag of sporter-toegang (briefing V3) blijft mogelijk, maar
    vereist een nieuwe ADR die deze beslissing vervangt — inclusief het volledige AVG-regime.
  - Het exacte JSON-schema (komt voort uit de datamodel-ADR / de bestaande TypeScript-types).
  - **Trigger om te heroverwegen**: zodra het lab automatische centrale historie of online
    sporter-toegang écht nodig heeft.
