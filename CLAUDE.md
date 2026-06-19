# VIA — werkwijze

Dit document is het kompas voor het project. Lees dit eerst bij elke nieuwe sessie, vóór er
code geschreven wordt. Het is bewust streng op de plekken waar het vorige project (en de manier
van werken) is misgegaan — zie [`START.md`](./START.md) voor het waarom.

## 1. Fundament-eerst (de hoofdregel)

Geen feature wordt gebouwd vóór het fundament staat. Reden: in het vorige project kwamen de
duurste fouten voort uit features op een fragiel, ongevalideerd fundament — **stil fout, en pas
ontdekt via gebruikers of live**. Volgorde, geen concessies:

1. **Fundament** — premisse + betrouwbaarheid (monitoring/test-gate/backups) + correctheid &
   verificatie.
2. **Opschoning / architectuur.**
3. **Features**, in kleine fases.
4. **Verificatie-automatisering** (mag deels parallel).

Fase 1 is de must-have vóór "echt gebruiken"; latere fases volgen zoveel als de tijd toelaat —
zonder concessies aan kwaliteit.

## 2. Beslissingsprotocol

Bij elke niet-triviale keuze (architectuur, tech, datamodel, UX-patroon, conventie) levert
Claude: **opties** (min. 2, met voor-/nadelen) → **aanbeveling** → **toekomstgevolgen** (wat legt
dit vast, wat houdt het open). Daarna beslist de eigenaar. Uitkomst = een ADR (zie §4).

Triviaal = onomkeerbaar laag risico (formattering, lokale hernoeming, typo's). Bij twijfel: niet
triviaal — vraag het.

## 3. Definition of Done (incl. verificatie — niet uitstellen)

Iets is pas "af" bij **alle** van:
- tests groen (verplichte CI-test-gate);
- een ADR voor de niet-triviale keuze;
- een **fail-visible**-rand waar relevant (fout wordt zichtbaar, niet stil);
- **Claude heeft het zélf zien werken** — de app gedraaid / de wijziging geverifieerd, niet
  "het lijkt goed";
- **STAND.md klopt** — de stand (status, volgende stap, fundament-checklist) is bijgewerkt. Een
  STAND.md die achterloopt liegt en voedt latere beslissingen met verouderde context; daarom is
  een plakje pas "af" als de stand weer klopt.

Verificatie hoort vóór vertrouwen en vóór deploy, niet bij de eerste echte gebruiker. Dit is de
expliciete tegenhanger van de "valideren-achteraf"-valkuil.

## 4. Beslislogboek (ADR's)

Architectonische beslissingen leven in [`docs/decisions/`](./docs/decisions/) als genummerde
markdown-bestanden. Format en proces: zie [`docs/decisions/README.md`](./docs/decisions/README.md).
Elke ADR heeft *Toekomstgevolgen* — wat legt deze keuze vast, wat houdt ze open. Dit is het
anti-legacy-mechanisme: elke niet-triviale keuze is bewust, gemotiveerd en vindbaar.

## 5. Scope-rem

Als een taak gaandeweg groeit buiten z'n oorspronkelijke kader: **pauzeer, benoem de
scope-groei expliciet, en leg de keuze voor** (zo groot maken vs terugsnijden vs apart plannen).
Geen stille uitdijing — dat is hoe complexiteit aankoekt.

## 6. Fundament-baseline vanaf dag 1 (gepast bij de schaal)

Monitoring/health-check, verplichte CI-test-gate, backups, en — waar van toepassing — auth +
privacy/bewaartermijn worden **vroeg** geregeld, niet achteraf bijgeplakt. Sized naar het
project; maar nooit "later".

## 7. Ops zonder frictie

Claude regelt CLI/deploy/infra zelf, of wijst een **klikbaar (web-)pad** aan. **Nooit een batch
terminal-commando's.** Als de eigenaar echt iets moet doen: één simpel stapje tegelijk, met een
korte uitleg, en wacht op bevestiging.

## 8. Samenwerking

- Keuzes via een **keuze-popup**, niet als getypte lijst.
- **Eén stap tegelijk**; wacht op bevestiging; niet in batch.
- Bij een nieuwe vraag: geen oude context binnenhalen tenzij de eigenaar er zelf naar verwijst.
- **Nederlands** voor UI/content/foutmeldingen, documentatie en ADR's. Code/commits/comments
  vrij, mits consistent binnen één bestand.

> **Bewuste niet-keuze:** deze kit gaat uit van **één eigenaar + AI**. Stapt er een tweede
> menselijke bouwer in, dan herzien we §8 en de taalkeuze via ADR's (zie
> [`docs/decisions/README.md`](./docs/decisions/README.md)). Tot dan is dit het bewuste,
> vastgelegde uitgangspunt — geen impliciete aanname.

## 9. Git & deploy

- Git vanaf dag 0. Kleine, samenhangende commits. Geen secrets in commits (`.env*` in
  `.gitignore`).
- Werkbranch → merge naar `main` = **bewuste deploy**.
- **Geen deploys in een kritiek live-venster**, behalve een hotfix op expliciet verzoek.

## 10. Wat Claude expliciet níet doet

- Tech-keuzes "alvast" invullen zonder ADR.
- Abstracties/helpers maken zonder concrete, bestaande aanleiding.
- Features bouwen vóór het fundament staat (§1).
- Een wijziging "af" noemen zonder het zelf geverifieerd te hebben (§3).
- Patronen klakkeloos uit eerdere projecten kopiëren zonder weging.

## 11. Muren, niet afspraken

De rest van dit document beschrijft veel **discipline**: "verplichte test-gate", "geen deploys in
een kritiek live-venster", "geen secrets in commits". Discipline leunt op gedrag — en gedrag
breekt onder druk. Dat is hier een bekende zwakte: afspraken sneuvelen precies op het moment dat
ze het hardst nodig zijn. Een regel is pas betrouwbaar als **techniek** hem afdwingt. Dan is het
een **muur**, geen afspraak.

- **Muur** — techniek blokkeert de fout; je kúnt de regel niet per ongeluk of onder druk breken.
- **Discipline** — de regel leunt op gedrag/oordeel. Onmisbaar, maar feilbaar; houd 'm zichtbaar.

### Welke regels muur worden (en hoe)

- **CI-test-gate → muur met branch protection op `main`.** De CI-workflow alléén is een *lampje*,
  geen poort: hij kleurt rood maar houdt niets tegen. Pas met branch protection op `main` — merge
  technisch geblokkeerd tot de check groen is — is het een muur. Zonder die instelling blijft de
  test-gate uit §3/§6 discipline.
- **"Geen deploys in een kritiek live-venster" → technische deploy-freeze.** Niet onthouden, maar
  afdwingen: een vlag die je vóóraf, in rust, aanzet en die de deploy weigert. Opheffen kan alleen
  via bewuste frictie — een commit die de vlag terugzet. Die frictie ís het mechanisme: ze dwingt
  een rustig, expliciet moment af in plaats van een impuls. Hiermee wordt §9's "geen deploys in
  live-venster" een muur.
- **Secret-scan in CI → harde merge-blokkade.** `.env*` in `.gitignore` (§9) is discipline: het
  helpt niet als er per ongeluk een sleutel elders in een commit belandt. Een secret-scan die de
  merge hard blokkeert zodra er een sleutel in een commit zit, is de muur eromheen.

### Stand van de bestaande regels

| Regel | Laag | Muur via |
|---|---|---|
| §3 tests groen (test-gate) | Muur* | branch protection op `main` |
| §3 STAND.md klopt | DoD-poort | reviewcheck vóór merge |
| §3 zelf-zien-werken, ADR, fail-visible | Discipline | — (oordeel) |
| §6 test-gate / secret-scan | Muur* | branch protection + secret-scan |
| §6 monitoring / backups | Discipline | config, niet merge-afgedwongen |
| §9 geen deploy in live-venster | Muur* | deploy-freeze-vlag |
| §9 geen secrets in commits | Muur* | secret-scan in CI |
| §9 kleine commits / bewuste merge | Discipline | — (oordeel) |

\* = pas écht een muur zodra de techniek (branch protection / freeze-vlag / secret-scan)
daadwerkelijk staat. Tot dan is het discipline met een rood lampje. Het opzetten hiervan hoort bij
de fundament-baseline (§6) — niet "later".
