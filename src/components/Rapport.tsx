// Rapport-scherm (Slice 3): de gekozen combi-richting, module-gestuurd. Leest UITSLUITEND uit het
// rapport-model (ADR-0019) + de template-teksten (ADR-0021) — één bron van waarheid, geen
// eigen berekening, geen AI. Functioneel-correct; de world-leading designlaag komt in Slice 3c.

import { LactaatGrafiek } from './LactaatGrafiek'
import { RapportReis } from './RapportReis'
import { AdemgasReis } from './AdemgasReis'
import { Term } from './Term'
import { formatIntensiteit } from '../lib/invoer'
import type { RapportModel, RapportZone } from '../lib/rapportmodel'
import type { SportType } from '../lib/types'
import {
  samenvattingZin,
  samenvattingVo2maxZin,
  betrouwbaarheidZin,
  drempelBetekenis,
  vo2maxZin,
  ademgasReisStappen,
  combinatieDuiding,
  drempelsConsistent,
  ZONE_BETEKENIS,
} from '../lib/rapporttekst'
import './Rapport.css'

const bpm = (n: number | null) => (n != null ? `${Math.round(n)} bpm` : '—')
const een = (n: number) => n.toFixed(1).replace('.', ',')

const SPORT_LABEL: Record<SportType, string> = {
  cycling: 'Fietsen',
  running: 'Lopen',
  rowing: 'Roeien',
}

interface Kpi {
  label: string
  term?: string
  waarde: string
  eenheid: string
  sub: string
  primair?: boolean
}

function bereik(laag: number | null, hoog: number | null, fmt: (n: number) => string): string {
  if (laag == null && hoog == null) return '—'
  if (laag == null) return `< ${fmt(hoog as number)}`
  if (hoog == null) return `> ${fmt(laag)}`
  return `${fmt(laag)}–${fmt(hoog)}`
}

function ZoneTabel({ titel, zones, sport }: { titel: string; zones: RapportZone[]; sport: SportType }) {
  if (zones.length === 0) return null
  const fx = (x: number) => formatIntensiteit(sport, x, null)
  return (
    <div className="rap-zones">
      <h3>{titel}</h3>
      <table className="rap-tabel rap-zonetabel">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Intensiteit</th>
            <th>Hartslag</th>
            <th>Wat er gebeurt</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.code}>
              <th>
                <span className="rap-zonecode" data-zone={z.code}>
                  {z.code}
                </span>{' '}
                {z.naam}
              </th>
              <td className="rap-getalcel">{bereik(z.min, z.max, fx)}</td>
              <td className="rap-getalcel">
                {bereik(z.hrMin, z.hrMax, (n) => `${Math.round(n)}`)}
                {(z.hrMin != null || z.hrMax != null) && ' bpm'}
              </td>
              <td className="rap-zoneduiding">{ZONE_BETEKENIS[z.code] ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Rapport({ model }: { model: RapportModel }) {
  const { lactaat, vo2max, combinatie, deelnemer, test, actief } = model
  // Schoon kerngetal (zonder W/kg-toevoeging) voor de grote cijfers.
  const schoon = (x: number) => formatIntensiteit(test.sport, x, null)

  const lt1 = lactaat?.drempels.find((d) => d.code === 'LT1')
  const lt2 = lactaat?.drempels.find((d) => d.code === 'LT2')

  // KPI's, module-gestuurd. Lactaat voert de boventoon als die actief is, anders ademgas.
  const lactaatPrimair = actief.lactaat
  const kpis: Kpi[] = []
  if (lactaat) {
    if (lt2)
      kpis.push({ label: 'Anaerobe drempel', term: 'Anaerobe drempel', waarde: schoon(lt2.intensiteit), eenheid: '', sub: `${bpm(lt2.hr)} · ${een(lt2.lactaat)} mmol/L`, primair: lactaatPrimair })
    if (lt1)
      kpis.push({ label: 'Aerobe drempel', term: 'Aerobe drempel', waarde: schoon(lt1.intensiteit), eenheid: '', sub: `${bpm(lt1.hr)} · ${een(lt1.lactaat)} mmol/L` })
  }
  if (vo2max?.vo2max.mlPerKgMin != null)
    kpis.push({
      label: 'VO₂max',
      term: 'VO₂max',
      waarde: String(Math.round(vo2max.vo2max.mlPerKgMin)),
      eenheid: 'ml/kg/min',
      sub: vo2max.vo2max.lPerMin != null ? `${een(vo2max.vo2max.lPerMin)} L/min` : '',
      primair: !lactaatPrimair,
    })
  if (vo2max?.vo2max.hrPiek != null)
    kpis.push({ label: 'Hartslagpiek', waarde: String(Math.round(vo2max.vo2max.hrPiek)), eenheid: 'bpm', sub: 'Gemeten maximum' })

  const chips = [
    deelnemer.leeftijd != null ? `${deelnemer.leeftijd} jaar` : null,
    deelnemer.gewichtKg != null ? `${deelnemer.gewichtKg} kg` : null,
    test.datum,
    test.testleider ? `Testleider ${test.testleider}` : null,
    SPORT_LABEL[test.sport],
    test.apparatuur,
  ].filter(Boolean) as string[]

  const LactaatSecties = lactaat ? (
    <>
      <section className="rap-sectie">
        <h2>Je resultaten, stap voor stap</h2>
        <p className="rap-lead rap-intro">Scroll mee — de grafiek bouwt zich onderweg op.</p>
        <RapportReis model={model} />
        {betrouwbaarheidZin(model) && <p className="rap-eerlijk">{betrouwbaarheidZin(model)}</p>}
      </section>

      <section className="rap-sectie">
        <h2>De cijfers op een rij</h2>
        <div className="rap-grid2">
          {lt1 && (
            <article className="rap-kaart">
              <span className="rap-eyebrow">Eerste · aerobe drempel</span>
              <div className="rap-kaart__getal">{schoon(lt1.intensiteit)}</div>
              <div className="rap-kaart__sub">
                {bpm(lt1.hr)} · {een(lt1.lactaat)} mmol/L
              </div>
            </article>
          )}
          {lt2 && (
            <article className="rap-kaart">
              <span className="rap-eyebrow">Tweede · anaerobe drempel</span>
              <div className="rap-kaart__getal">{schoon(lt2.intensiteit)}</div>
              <div className="rap-kaart__sub">
                {bpm(lt2.hr)} · {een(lt2.lactaat)} mmol/L
              </div>
            </article>
          )}
        </div>
        {drempelBetekenis(model, 'OBLA') && (
          <p className="rap-obla">{drempelBetekenis(model, 'OBLA')}</p>
        )}
        <ZoneTabel titel="Op de drempels (3 zones)" zones={lactaat.drempelzones} sport={test.sport} />
        <ZoneTabel titel="Vijf trainingszones" zones={lactaat.trainingszones} sport={test.sport} />
      </section>
    </>
  ) : null

  const Primer = (
    <section className="rap-sectie rap-primer">
      <h2>Over deze test</h2>
      <p className="rap-lead">
        {actief.lactaat && vo2max
          ? 'We hebben twee dingen gemeten. Je lactaat — een stofje dat je lichaam aanmaakt bij het verbranden van energie, en steeds meer naarmate je inspanning oploopt — via een paar druppels bloed per belastingstap. En je ademgas — hoeveel zuurstof je lichaam verwerkt. Samen geven ze een compleet beeld van je uithoudingsvermogen.'
          : actief.lactaat
            ? 'We hebben je lactaat gemeten — een stofje dat je lichaam aanmaakt bij het verbranden van energie, en steeds meer naarmate je harder gaat — via een paar druppels bloed per belastingstap. Daaruit volgen je curve, je drempels en je trainingszones.'
            : 'We hebben je ademgas gemeten: via je uitgeademde lucht bepalen we hoeveel zuurstof je lichaam maximaal verwerkt (je VO₂max) en waar je twee ventilatoire drempels liggen — de punten waarop je ademhaling omslaat.'}
      </p>
      {lactaat ? (
        <p className="rap-info">
          Je leest hieronder eerst je resultaten als verhaal, daarna de cijfers op een rij, en tot
          slot kun je zelf door je eigen curve bewegen.
        </p>
      ) : (
        <p className="rap-info">
          Je leest hieronder eerst je resultaten als verhaal en daarna de cijfers op een rij. Bij een
          ademgasanalyse is er geen lactaatcurve om zelf doorheen te bewegen.
        </p>
      )}
    </section>
  )

  const VerkenSectie = lactaat ? (
    <section className="rap-sectie">
      <h2>Verken je eigen curve</h2>
      <p className="rap-lead">
        Sleep over de grafiek om op elke intensiteit je lactaat, hartslag en zone af te lezen.
      </p>
      <LactaatGrafiek model={model} />
    </section>
  ) : null

  const AdemgasReisSectie =
    vo2max != null && ademgasReisStappen(model).length > 0 ? (
      <section className="rap-sectie">
        <h2>Je resultaten, stap voor stap</h2>
        <p className="rap-lead rap-intro">Scroll mee — je zuurstofopname bouwt zich onderweg op.</p>
        <AdemgasReis model={model} />
      </section>
    ) : null

  const AdemgasSectie =
    vo2max != null ? (
      <section className="rap-sectie">
        <h2>Ademgasanalyse (VO₂max)</h2>
        <p className="rap-lead">{vo2maxZin(model)}</p>
        <p className="rap-info">
          De ademgasanalyse meet via je uitgeademde lucht hoeveel zuurstof je lichaam maximaal
          verwerkt (VO₂max) en bepaalt de twee ventilatoire drempels (VT1 en VT2). Zo kijkt deze
          meting met een tweede, onafhankelijke methode naar dezelfde overgangen als de lactaattest.
        </p>
        <table className="rap-tabel">
          <thead>
            <tr>
              <th>Drempel</th>
              <th>VO₂</th>
              <th>Hartslag</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <Term k="VT1">Ventilatoire drempel 1 (VT1)</Term>
              </th>
              <td>{vo2max.vt1.vo2LPerMin != null ? `${een(vo2max.vt1.vo2LPerMin)} L/min` : '—'}</td>
              <td>{bpm(vo2max.vt1.hr)}</td>
            </tr>
            <tr>
              <th>
                <Term k="VT2">Ventilatoire drempel 2 (VT2)</Term>
              </th>
              <td>{vo2max.vt2.vo2LPerMin != null ? `${een(vo2max.vt2.vo2LPerMin)} L/min` : '—'}</td>
              <td>{bpm(vo2max.vt2.hr)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    ) : null

  return (
    <article className="rapport">
      <header className="rap-hero">
        <span className="rap-eyebrow rap-eyebrow--licht">
          Inspanningstest-rapport
          {actief.lactaat && actief.vo2max ? ' · combitest (lactaat + ademgas)' : ''}
        </span>
        <h1 className="rap-naam">{deelnemer.naam || 'Naamloos'}</h1>
        <div className="rap-chips">
          {chips.map((c) => (
            <span className="rap-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
        {model.waarschuwingen.length > 0 && (
          <ul className="rap-waarschuwingen">
            {model.waarschuwingen.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        <div className="rap-kpis">
          {kpis.map((k) => (
            <div className={`rap-kpi${k.primair ? ' rap-kpi--primair' : ''}`} key={k.label}>
              <span className="rap-kpi__label">
                {k.term ? <Term k={k.term}>{k.label}</Term> : k.label}
              </span>
              <span className="rap-kpi__getal">
                {k.waarde}
                {k.eenheid && <span className="rap-kpi__eenheid"> {k.eenheid}</span>}
              </span>
              <span className="rap-kpi__sub">{k.sub}</span>
            </div>
          ))}
        </div>
        {lactaatPrimair && samenvattingZin(model) && (
          <p className="rap-samenvatting">{samenvattingZin(model)}</p>
        )}
        {!lactaatPrimair && samenvattingVo2maxZin(model) && (
          <p className="rap-samenvatting">{samenvattingVo2maxZin(model)}</p>
        )}
      </header>

      {Primer}

      {lactaatPrimair ? (
        <>
          {LactaatSecties}
          {AdemgasSectie}
        </>
      ) : (
        <>
          {AdemgasReisSectie}
          {AdemgasSectie}
          {LactaatSecties}
        </>
      )}

      {combinatie && drempelsConsistent(model) != null && (
        <section className="rap-sectie">
          <h2>Twee metingen vergeleken</h2>
          <p className="rap-lead">{combinatieDuiding(model)}</p>
          <table className="rap-tabel">
            <thead>
              <tr>
                <th>Drempel</th>
                <th>Lactaat (hartslag)</th>
                <th>Ademgas (hartslag)</th>
                <th>Verschil</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Aeroob · LT1 ↔ VT1</th>
                <td>{bpm(combinatie.aeroob.lactaatHr)}</td>
                <td>{bpm(combinatie.aeroob.vtHr)}</td>
                <td>{combinatie.aeroob.deltaHr != null ? `${Math.round(combinatie.aeroob.deltaHr)} bpm` : '—'}</td>
              </tr>
              <tr>
                <th>Anaeroob · LT2 ↔ VT2</th>
                <td>{bpm(combinatie.anaeroob.lactaatHr)}</td>
                <td>{bpm(combinatie.anaeroob.vtHr)}</td>
                <td>{combinatie.anaeroob.deltaHr != null ? `${Math.round(combinatie.anaeroob.deltaHr)} bpm` : '—'}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {VerkenSectie}

      <footer className="rap-disclaimer">
        {/* TODO: definitieve tekst aanleveren door het lab (werk-/hygiëneprotocol). */}
        <span className="rap-disclaimer__concept">Concept · definitieve tekst volgt</span>
        Deze test is uitgevoerd volgens het werk- en hygiëneprotocol van het Hanze SportsFieldsLab
        Groningen.
      </footer>
    </article>
  )
}
