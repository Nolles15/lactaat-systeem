import type { SportType, Point } from '../lib/types'
import type { Analyse } from '../lib/analyse'
import { formatIntensiteit } from '../lib/invoer'
import { UITLEG, MEER_INFO_URL } from '../lib/uitleg'

interface Props {
  sport: SportType
  analyse: Analyse
  gewichtKg: number | null
}

const komma = (n: number) => n.toFixed(1).replace('.', ',')

export function Resultaten({ sport, analyse, gewichtKg }: Props) {
  const { drempels, r2, graad, coef, lt2Methode, hr, rpe, waarschuwingen } = analyse
  const lt1Sub = drempels.lt1 ? `baseline + ${komma(drempels.lt1.thr - drempels.lt1.baseline)}` : ''
  const lt2Sub = lt2Methode === 'moddmax' ? 'Modified-Dmax' : 'Dmax'
  const oblaSub = drempels.obla ? `${komma(drempels.obla.y)} mmol/L` : ''
  const toonHF = hr.lt1 !== null || hr.lt2 !== null || hr.obla !== null
  const toonRPE = rpe.lt1 !== null || rpe.lt2 !== null || rpe.obla !== null

  return (
    <div className="resultaten">
      {coef !== null && (
        <>
          <table className="resultaten__tabel">
            <thead>
              <tr>
                <th>Drempel</th>
                <th>Intensiteit</th>
                <th>Lactaat</th>
                {toonHF && <th>Hartslag</th>}
                {toonRPE && <th>RPE</th>}
              </tr>
            </thead>
            <tbody>
              <Drempelrij naam="LT1" sub={lt1Sub} sport={sport} gewichtKg={gewichtKg} punt={drempels.lt1} toonHF={toonHF} hr={hr.lt1} toonRPE={toonRPE} rpe={rpe.lt1} />
              <Drempelrij naam="LT2" sub={lt2Sub} sport={sport} gewichtKg={gewichtKg} punt={drempels.lt2} toonHF={toonHF} hr={hr.lt2} toonRPE={toonRPE} rpe={rpe.lt2} />
              <Drempelrij naam="OBLA" sub={oblaSub} sport={sport} gewichtKg={gewichtKg} punt={drempels.obla} toonHF={toonHF} hr={hr.obla} toonRPE={toonRPE} rpe={rpe.obla} />
            </tbody>
          </table>
          <p className="resultaten__meta">
            Polynoomgraad {graad} · R² {r2!.toFixed(3)}
          </p>
        </>
      )}

      {waarschuwingen.length > 0 && (
        <ul className="waarschuwingen">
          {waarschuwingen.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      )}

      <details className="uitleg">
        <summary>Wat betekenen deze waarden?</summary>
        <dl>
          {UITLEG.map((u) => (
            <div key={u.term}>
              <dt>{u.term}</dt>
              <dd>{u.tekst}</dd>
            </div>
          ))}
        </dl>
        <a href={MEER_INFO_URL} target="_blank" rel="noopener noreferrer">
          Meer informatie over lactaatdrempels →
        </a>
      </details>
    </div>
  )
}

function Drempelrij({
  naam,
  sub,
  sport,
  gewichtKg,
  punt,
  toonHF,
  hr,
  toonRPE,
  rpe,
}: {
  naam: string
  sub: string
  sport: SportType
  gewichtKg: number | null
  punt: Point | null
  toonHF: boolean
  hr: number | null
  toonRPE: boolean
  rpe: number | null
}) {
  return (
    <tr>
      <th>
        {naam}
        <span className="drempel-sub">{sub}</span>
      </th>
      <td>{punt ? formatIntensiteit(sport, punt.x, gewichtKg) : 'niet bereikt'}</td>
      <td>{punt ? `${punt.y.toFixed(1).replace('.', ',')} mmol/L` : '—'}</td>
      {toonHF && <td>{hr !== null ? `${Math.round(hr)} bpm` : '—'}</td>}
      {toonRPE && <td>{rpe !== null ? `${Math.round(rpe)}` : '—'}</td>}
    </tr>
  )
}
