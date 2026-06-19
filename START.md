# Startkit — lees dit eerst

Deze map is een **kant-en-klare projectstart**, gedestilleerd uit de lessen van het vorige
project (triathlon-dashboard). Doel: dezelfde valkuilen vanaf dag 0 vermijden. Werkafspraak
staat in [`CLAUDE.md`](./CLAUDE.md); de ADR-werkwijze in
[`docs/decisions/README.md`](./docs/decisions/README.md); het lopende kompas in
[`docs/STAND.md`](./docs/STAND.md).

## De kickoff-prompt (plak dit in het eerste gesprek)

```
Nieuw project: <één zin: wat is het + voor wie + waarom uniek>.

Werk FUNDAMENT-EERST — geen features tot het fundament staat. Doorloop met mij,
vóór er code komt, en leg elke niet-triviale keuze vast als ADR:

  1. Premisse   — wie is de gebruiker, wat is de unieke waarde, wat is succes
                  (en hoe meet ik dat)?
  2. Betrouwbaarheid — hoe weet ik DÁT het stuk is (monitoring/alerting), wat is
                  de verplichte test-gate, hoe zit het met backups, en wat gebeurt
                  er bij N gelijktijdige gebruikers — wat wordt gecachet, wat is het
                  koude pad?
  3. Correctheid + verificatie — hoe weet ik dat het ÉCHT klopt, en hoe verifieer
                  ik ELKE wijziging (draaien/zien) vóór ik 'm vertrouw of deploy?

Pas dáárna features, in kleine fases. Werkafspraken: zie CLAUDE.md.
- Keuzes als popup, niet als lap tekst. Eén stap tegelijk, wacht op bevestiging.
- Definition of Done = tests groen + ADR + fail-visible waar relevant + je hebt
  het ÉCHT zien werken (niet "lijkt goed").
- Als een "kleine" taak gaandeweg groeit: STOP, benoem de scope-groei, laat mij kiezen.
- Regel CLI/deploy/infra zelf of via klikbare paden; overlaad me niet met terminal-commando's.
```

## Waarom deze opzet — de lessen in het kort

Bijna élk pijnpunt in het vorige project had één wortel: **features op een ongevalideerd
fundament, met problemen die pas live/via gebruikers zichtbaar werden** (stille parse-bug,
meltdown onder load, cold-start, deploy-blips, oude cache, ongetest naar productie, open
`/beheer`). De fix die het project zelf vond: fundament-eerst, alles bewust (ADR), fail-visible,
verifiëren — maar pas ná de pijn. Deze kit zet dat aan de voorkant.

## De valkuilen die deze kit afvangt (en waar in CLAUDE.md)

| Valkuil | Tegenmaatregel |
|---|---|
| Valideren-achteraf (fouten pas live zichtbaar) | §3 Definition of Done: "zélf zien werken" vóór vertrouwen/deploy |
| Features op een fragiel fundament | §1 Fundament-eerst; §6 baseline vanaf dag 1 |
| Scope groeit ongemerkt tijdens een taak | §5 Scope-rem (pauzeer + leg keuze voor) |
| Ops/infra/security uitgesteld of frustrerend | §6 vroeg regelen; §7 ops zonder frictie |
| Tempo boven zorgvuldigheid onder druk | §3 DoD-poort; §9 geen deploys in live-venster |
| Legacy-by-accident | §2 + §4 ADR-discipline (bewust, gemotiveerd, vindbaar) |
| Afspraak breekt onder druk | §11 Muren-laag: branch protection, deploy-freeze, secret-scan (techniek dwingt af) |
| Load/concurrency niet vooraf bedacht | Intake stap 2: expliciete load-vraag (N gebruikers, cache, koud pad) |

## Volgende stap

Vul hierboven de projectzin in, plak de kickoff-prompt, en laat Claude de fundament-intake
(premisse → betrouwbaarheid → correctheid/verificatie) doorlopen — pas daarna code.
