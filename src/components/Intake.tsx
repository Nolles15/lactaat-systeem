import type { Deelnemer, TestMeta, Geslacht } from '../lib/sessie'
import { naamGeldig } from '../lib/sessie'
import type { SportType } from '../lib/types'
import { apparatuurVoor } from '../lib/apparatuur'

interface Props {
  sport: SportType
  deelnemer: Deelnemer
  testmeta: TestMeta
  onDeelnemerChange: (d: Deelnemer) => void
  onTestMetaChange: (t: TestMeta) => void
}

export function Intake({ sport, deelnemer, testmeta, onDeelnemerChange, onTestMetaChange }: Props) {
  const naamOk = naamGeldig(deelnemer.naam)
  const setD = (patch: Partial<Deelnemer>) => onDeelnemerChange({ ...deelnemer, ...patch })
  const setT = (patch: Partial<TestMeta>) => onTestMetaChange({ ...testmeta, ...patch })

  return (
    <section className="paneel intake">
      <h2>Intake</h2>
      <p className="intake__privacy">
        Deze gegevens blijven in deze sessie en worden niet opgeslagen; ze verlaten de app alleen via
        een export (ADR-0001).
      </p>
      <div className="intake-grid">
        <label className="veld">
          <span>
            Naam <span className="verplicht" aria-hidden="true">*</span>
          </span>
          <input
            className={naamOk ? '' : 'is-ongeldig'}
            value={deelnemer.naam}
            onChange={(e) => setD({ naam: e.target.value })}
            placeholder="Voor- en achternaam"
            aria-invalid={!naamOk}
            aria-required="true"
          />
          {!naamOk && <span className="veld-fout">Naam is verplicht</span>}
        </label>

        <label className="veld">
          <span>Testdatum</span>
          <input type="date" value={testmeta.datum} onChange={(e) => setT({ datum: e.target.value })} />
        </label>

        <label className="veld">
          <span>Geboortedatum</span>
          <input
            type="date"
            value={deelnemer.geboortedatum}
            onChange={(e) => setD({ geboortedatum: e.target.value })}
          />
        </label>

        <label className="veld">
          <span>Geslacht</span>
          <select
            value={deelnemer.geslacht}
            onChange={(e) => setD({ geslacht: e.target.value as Geslacht })}
          >
            <option value="">—</option>
            <option value="man">Man</option>
            <option value="vrouw">Vrouw</option>
            <option value="anders">Anders</option>
          </select>
        </label>

        <label className="veld">
          <span>Lichaamsgewicht (kg)</span>
          <input
            inputMode="decimal"
            value={deelnemer.gewichtKg}
            onChange={(e) => setD({ gewichtKg: e.target.value })}
            placeholder="bijv. 72"
          />
        </label>

        <label className="veld">
          <span>Testleider</span>
          <input
            value={testmeta.testleider}
            onChange={(e) => setT({ testleider: e.target.value })}
            placeholder="Naam testleider"
          />
        </label>

        <label className="veld veld--breed">
          <span>Notities</span>
          <textarea
            value={testmeta.notities}
            onChange={(e) => setT({ notities: e.target.value })}
            rows={2}
            placeholder="Bijzonderheden tijdens de test"
          />
        </label>

        <div className="veld">
          <span>Apparatuur (automatisch)</span>
          <output className="apparatuur">{apparatuurVoor(sport)}</output>
        </div>
      </div>
    </section>
  )
}
