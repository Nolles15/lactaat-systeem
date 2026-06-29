// Rapport-scherm (Slice 3): de gekozen combi-richting, module-gestuurd. Leest UITSLUITEND uit het
// rapport-model (ADR-0019) + de template-teksten (ADR-0021) — één bron van waarheid, geen
// eigen berekening, geen AI. Functioneel-correct; de world-leading designlaag komt in Slice 3c.

import { LactaatGrafiek } from './LactaatGrafiek'
import { formatIntensiteit } from '../lib/invoer'
import type { RapportModel, RapportZone } from '../lib/rapportmodel'
import type { SportType } from '../lib/types'
import {
  samenvattingZin,
  drempelBetekenis,
  curveBeschrijving,
  betrouwbaarheidZin,
  vo2maxZin,
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
  waarde: string
  eenheid: string
  sub: string
  primair?: boolean
}

function Betekenis({ tekst }: { tekst: string | null }) {
  if (!tekst) return null
  return (
    <p className="rap-betekenis">
      <span className="rap-betekenis__kop">Wat dit betekent</span>
      {tekst}
    </p>
  )
}

function ZoneTabel({ titel, zones, eenheid }: { titel: string; zones: RapportZone[]; eenheid: string }) {
  if (zones.length === 0) return null
  return (
    <div className="rap-zones">
      <h3>{titel}</h3>
      <table className="rap-tabel">
        <thead>
          <tr>
            <th>Zone</th>
            <th>{eenheid}</th>
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
              <td>
                {z.minLabel} – {z.maxLabel}
              </td>
              <td>
                {z.hrMin != null ? bpm(z.hrMin) : '—'} – {z.hrMax != null ? bpm(z.hrMax) : '—'}
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
  const eenheid = test.sport === 'running' ? 'Snelheid' : 'Vermogen'
  // Schoon kerngetal (zonder W/kg-toevoeging) voor de grote cijfers.
  const schoon = (x: number) => formatIntensiteit(test.sport, x, null)

  const lt1 = lactaat?.drempels.find((d) => d.code === 'LT1')
  const lt2 = lactaat?.drempels.find((d) => d.code === 'LT2')

  // KPI's, module-gestuurd. Lactaat voert de boventoon als die actief is, anders ademgas.
  const lactaatPrimair = actief.lactaat
  const kpis: Kpi[] = []
  if (lactaat) {
    if (lt2)
      kpis.push({ label: 'Anaerobe drempel', waarde: schoon(lt2.intensiteit), eenheid: '', sub: `${bpm(lt2.hr)} · ${een(lt2.lactaat)} mmol/L`, primair: lactaatPrimair })
    if (lt1)
      kpis.push({ label: 'Aerobe drempel', waarde: schoon(lt1.intensiteit), eenheid: '', sub: `${bpm(lt1.hr)} · ${een(lt1.lactaat)} mmol/L` })
  }
  if (vo2max?.vo2max.mlPerKgMin != null)
    kpis.push({
      label: 'VO₂max',
      waarde: String(Math.round(vo2max.vo2max.mlPerKgMin)),
      eenheid: 'ml/kg/min',
      sub: vo2max.vo2max.lPerMin != null ? `${een(vo2max.vo2max.lPerMin)} L/min` : '',
      primair: !lactaatPrimair,
    })
  if (vo2max?.vo2max.hrPiek != null)
    kpis.push({ label: 'Hartslag-piek', waarde: String(Math.round(vo2max.vo2max.hrPiek)), eenheid: 'bpm', sub: 'Gemeten maximum' })

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
        <h2>Je inspanningscurve</h2>
        <p className="rap-lead">{curveBeschrijving(model)}</p>
        <LactaatGrafiek model={model} />
        {betrouwbaarheidZin(model) && <p className="rap-eerlijk">{betrouwbaarheidZin(model)}</p>}
      </section>

      <section className="rap-sectie">
        <h2>Je drempels</h2>
        <div className="rap-grid2">
          {lt1 && (
            <article className="rap-kaart">
              <span className="rap-eyebrow">Eerste · aerobe drempel</span>
              <div className="rap-kaart__getal">{schoon(lt1.intensiteit)}</div>
              <div className="rap-kaart__sub">
                {bpm(lt1.hr)} · {een(lt1.lactaat)} mmol/L
              </div>
              <Betekenis tekst={drempelBetekenis(model, 'LT1')} />
            </article>
          )}
          {lt2 && (
            <article className="rap-kaart">
              <span className="rap-eyebrow">Tweede · anaerobe drempel</span>
              <div className="rap-kaart__getal">{schoon(lt2.intensiteit)}</div>
              <div className="rap-kaart__sub">
                {bpm(lt2.hr)} · {een(lt2.lactaat)} mmol/L
              </div>
              <Betekenis tekst={drempelBetekenis(model, 'LT2')} />
            </article>
          )}
        </div>
        {drempelBetekenis(model, 'OBLA') && <Betekenis tekst={drempelBetekenis(model, 'OBLA')} />}
      </section>

      <section className="rap-sectie">
        <h2>Je trainingszones</h2>
        <ZoneTabel titel="Op de drempels (3 zones)" zones={lactaat.drempelzones} eenheid={eenheid} />
        <ZoneTabel titel="Vijf trainingszones" zones={lactaat.trainingszones} eenheid={eenheid} />
      </section>
    </>
  ) : null

  const AdemgasSectie =
    vo2max != null ? (
      <section className="rap-sectie">
        <h2>Ademgasanalyse (VO₂max)</h2>
        <p className="rap-lead">{vo2maxZin(model)}</p>
        <p className="rap-info">
          De ademgasanalyse meet via de uitgeademde lucht hoeveel zuurstof je lichaam maximaal
          verwerkt (VO₂max) en bepaalt de ventilatoire drempels. Dit vult de lactaatmeting aan vanuit
          een tweede meetmethode — ter informatie, niet als losse wetenschappelijke onderbouwing.
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
              <th>Ventilatoir 1 (VT1)</th>
              <td>{vo2max.vt1.vo2LPerMin != null ? `${een(vo2max.vt1.vo2LPerMin)} L/min` : '—'}</td>
              <td>{bpm(vo2max.vt1.hr)}</td>
            </tr>
            <tr>
              <th>Ventilatoir 2 (VT2)</th>
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
              <span className="rap-kpi__label">{k.label}</span>
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
      </header>

      {lactaatPrimair ? (
        <>
          {LactaatSecties}
          {AdemgasSectie}
        </>
      ) : (
        <>
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

      <footer className="rap-disclaimer">
        {/* TODO: definitieve tekst aanleveren door het lab (werk-/hygiëneprotocol). */}
        <span className="rap-disclaimer__concept">Concept · definitieve tekst volgt</span>
        Deze test is uitgevoerd volgens het werk- en hygiëneprotocol van het Hanze Inspanningslab ·
        SportsFieldsLab Groningen.
      </footer>
    </article>
  )
}
