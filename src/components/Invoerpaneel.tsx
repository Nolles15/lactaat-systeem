import type { SportType } from '../lib/types'
import {
  intensiteitLabel,
  intensiteitPlaceholder,
  parseIntensiteit,
  parseLactaat,
  LACTAAT_MAX,
} from '../lib/invoer'

export interface Rij {
  intensiteit: string
  lactaat: string
}

export function legeRijen(n: number): Rij[] {
  return Array.from({ length: n }, () => ({ intensiteit: '', lactaat: '' }))
}

interface Props {
  sport: SportType
  rijen: Rij[]
  onSportChange: (s: SportType) => void
  onRijenChange: (r: Rij[]) => void
}

export function Invoerpaneel({ sport, rijen, onSportChange, onRijenChange }: Props) {
  const updateRij = (i: number, veld: keyof Rij, waarde: string) =>
    onRijenChange(rijen.map((r, idx) => (idx === i ? { ...r, [veld]: waarde } : r)))
  const voegRijToe = () => onRijenChange([...rijen, { intensiteit: '', lactaat: '' }])
  const verwijderRij = (i: number) => onRijenChange(rijen.filter((_, idx) => idx !== i))

  const geldigePunten = rijen.filter(
    (r) => parseIntensiteit(sport, r.intensiteit) !== null && parseLactaat(r.lactaat) !== null,
  ).length

  return (
    <section className="paneel invoer">
      <div className="invoer__kop">
        <h2>Meetpunten</h2>
        <div className="sport-toggle" role="group" aria-label="Sport">
          <button
            type="button"
            className={sport === 'cycling' ? 'is-actief' : ''}
            aria-pressed={sport === 'cycling'}
            onClick={() => onSportChange('cycling')}
          >
            Fietsen
          </button>
          <button
            type="button"
            className={sport === 'running' ? 'is-actief' : ''}
            aria-pressed={sport === 'running'}
            onClick={() => onSportChange('running')}
          >
            Lopen
          </button>
        </div>
      </div>

      <table className="invoer__tabel">
        <thead>
          <tr>
            <th className="col-nr">#</th>
            <th>{intensiteitLabel(sport)}</th>
            <th>Lactaat (mmol/L)</th>
            <th className="col-actie">
              <span className="sr-only">Acties</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rijen.map((rij, i) => {
            const intensiteitLeeg = rij.intensiteit.trim() === ''
            const intensiteitOk = intensiteitLeeg || parseIntensiteit(sport, rij.intensiteit) !== null
            const lactaatWaarde = parseLactaat(rij.lactaat)
            const lactaatOk = rij.lactaat.trim() === '' || lactaatWaarde !== null
            const lactaatHoog = lactaatWaarde !== null && lactaatWaarde > LACTAAT_MAX
            const kmh = sport === 'running' ? parseIntensiteit('running', rij.intensiteit) : null
            return (
              <tr key={i}>
                <td className="col-nr">{i + 1}</td>
                <td>
                  <input
                    className={intensiteitOk ? '' : 'is-ongeldig'}
                    inputMode={sport === 'running' ? 'text' : 'decimal'}
                    placeholder={intensiteitPlaceholder(sport)}
                    value={rij.intensiteit}
                    onChange={(e) => updateRij(i, 'intensiteit', e.target.value)}
                    aria-invalid={!intensiteitOk}
                  />
                  {kmh !== null && <span className="afgeleid">{kmh.toFixed(1)} km/u</span>}
                  {!intensiteitOk && <span className="veld-fout">ongeldig</span>}
                </td>
                <td>
                  <input
                    className={lactaatOk ? '' : 'is-ongeldig'}
                    inputMode="decimal"
                    placeholder="bijv. 2,1"
                    value={rij.lactaat}
                    onChange={(e) => updateRij(i, 'lactaat', e.target.value)}
                    aria-invalid={!lactaatOk}
                  />
                  {!lactaatOk && <span className="veld-fout">ongeldig</span>}
                  {lactaatHoog && <span className="veld-waarschuwing">controleer: &gt; {LACTAAT_MAX}</span>}
                </td>
                <td className="col-actie">
                  <button
                    type="button"
                    className="knop-verwijder"
                    onClick={() => verwijderRij(i)}
                    disabled={rijen.length <= 1}
                    aria-label={`Rij ${i + 1} verwijderen`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="invoer__voet">
        <button type="button" className="knop-secundair" onClick={voegRijToe}>
          + Rij toevoegen
        </button>
        <span className="invoer__telling">
          {geldigePunten} geldige meetpunt{geldigePunten === 1 ? '' : 'en'}
        </span>
      </div>
    </section>
  )
}
