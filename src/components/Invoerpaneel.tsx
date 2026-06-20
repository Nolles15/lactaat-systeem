import type { SportType } from '../lib/types'
import {
  intensiteitLabel,
  intensiteitPlaceholder,
  intensiteitAfgeleid,
  parseIntensiteit,
  parseLactaat,
  parseHartslag,
  parseRpe,
  LACTAAT_MAX,
} from '../lib/invoer'
import { legeRijen, type Rij } from '../lib/sessie'

interface Props {
  sport: SportType
  /** Lactaat in rust (vóór de eerste belastingsstap); intensiteit is per definitie 0. */
  rust: string
  rijen: Rij[]
  onSportChange: (s: SportType) => void
  onRustChange: (v: string) => void
  onRijenChange: (r: Rij[]) => void
}

export function Invoerpaneel({
  sport,
  rust,
  rijen,
  onSportChange,
  onRustChange,
  onRijenChange,
}: Props) {
  const updateRij = (i: number, veld: keyof Rij, waarde: string) =>
    onRijenChange(rijen.map((r, idx) => (idx === i ? { ...r, [veld]: waarde } : r)))
  const voegRijToe = () => onRijenChange([...rijen, legeRijen(1)[0]])
  const verwijderRij = (i: number) => onRijenChange(rijen.filter((_, idx) => idx !== i))
  const setUitgesloten = (i: number, val: boolean) =>
    onRijenChange(rijen.map((r, idx) => (idx === i ? { ...r, uitgesloten: val } : r)))

  const rustWaarde = parseLactaat(rust)
  const rustOk = rust.trim() === '' || rustWaarde !== null
  const rustHoog = rustWaarde !== null && rustWaarde > LACTAAT_MAX
  const geldigeStappen = rijen.filter(
    (r) => parseIntensiteit(sport, r.intensiteit) !== null && parseLactaat(r.lactaat) !== null,
  ).length
  const geldigePunten = (rustWaarde !== null ? 1 : 0) + geldigeStappen

  return (
    <div className="invoer">
      <div className="invoer-toolbar">
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
            <th>HF (bpm)</th>
            <th>RPE</th>
            <th className="col-fit">In fit</th>
            <th className="col-actie">
              <span className="sr-only">Acties</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Vaste ruststap vóór de eerste belasting (intensiteit = 0). */}
          <tr className="rij-rust">
            <td className="col-nr">R</td>
            <td>
              <span className="rust-label">
                Rust <span className="afgeleid">· 0 {sport === 'running' ? 'km/u' : 'W'}</span>
              </span>
            </td>
            <td>
              <input
                className={rustOk ? '' : 'is-ongeldig'}
                inputMode="decimal"
                placeholder="bijv. 1,2"
                value={rust}
                onChange={(e) => onRustChange(e.target.value)}
                aria-invalid={!rustOk}
                aria-label="Lactaat in rust"
              />
              {!rustOk && <span className="veld-fout">ongeldig</span>}
              {rustHoog && <span className="veld-waarschuwing">controleer: &gt; {LACTAAT_MAX}</span>}
            </td>
            <td></td>
            <td></td>
            <td className="col-fit"></td>
            <td className="col-actie"></td>
          </tr>

          {rijen.map((rij, i) => {
            const intensiteitLeeg = rij.intensiteit.trim() === ''
            const intensiteitOk = intensiteitLeeg || parseIntensiteit(sport, rij.intensiteit) !== null
            const lactaatWaarde = parseLactaat(rij.lactaat)
            const lactaatOk = rij.lactaat.trim() === '' || lactaatWaarde !== null
            const lactaatHoog = lactaatWaarde !== null && lactaatWaarde > LACTAAT_MAX
            const ingevoerd = parseIntensiteit(sport, rij.intensiteit)
            const afgeleid = ingevoerd !== null ? intensiteitAfgeleid(sport, ingevoerd) : null
            const hfOk = rij.hf.trim() === '' || parseHartslag(rij.hf) !== null
            const rpeOk = rij.rpe.trim() === '' || parseRpe(rij.rpe) !== null
            return (
              <tr key={i} className={rij.uitgesloten ? 'rij-uitgesloten' : undefined}>
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
                  {/* Lopen: pace (invoer) én km/u tonen. */}
                  {afgeleid && <span className="afgeleid">= {afgeleid}</span>}
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
                <td>
                  <input
                    className={hfOk ? '' : 'is-ongeldig'}
                    inputMode="numeric"
                    placeholder="optioneel"
                    value={rij.hf}
                    onChange={(e) => updateRij(i, 'hf', e.target.value)}
                    aria-invalid={!hfOk}
                  />
                  {!hfOk && <span className="veld-fout">ongeldig</span>}
                </td>
                <td>
                  <input
                    className={rpeOk ? '' : 'is-ongeldig'}
                    inputMode="numeric"
                    placeholder="6–20"
                    value={rij.rpe}
                    onChange={(e) => updateRij(i, 'rpe', e.target.value)}
                    aria-invalid={!rpeOk}
                  />
                  {!rpeOk && <span className="veld-fout">6–20</span>}
                </td>
                <td className="col-fit">
                  <input
                    type="checkbox"
                    checked={!rij.uitgesloten}
                    onChange={(e) => setUitgesloten(i, !e.target.checked)}
                    aria-label={`Stap ${i + 1} meenemen in de fit`}
                  />
                </td>
                <td className="col-actie">
                  <button
                    type="button"
                    className="knop-verwijder"
                    onClick={() => verwijderRij(i)}
                    disabled={rijen.length <= 1}
                    aria-label={`Stap ${i + 1} verwijderen`}
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
          + Stap toevoegen
        </button>
        <span className="invoer__telling">
          {geldigePunten} geldige meetpunt{geldigePunten === 1 ? '' : 'en'} (incl. rust)
        </span>
      </div>
    </div>
  )
}
