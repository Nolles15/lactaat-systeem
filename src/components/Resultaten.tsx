import type { SportType, Point } from '../lib/types'
import type { Analyse } from '../lib/analyse'
import { formatIntensiteit } from '../lib/invoer'
import { UITLEG, MEER_INFO_URL } from '../lib/uitleg'

interface Props {
  sport: SportType
  analyse: Analyse
}

const komma = (n: number) => n.toFixed(1).replace('.', ',')

export function Resultaten({ sport, analyse }: Props) {
  const { drempels, r2, graad, coef, lt2Methode, waarschuwingen } = analyse
  const lt1Sub = drempels.lt1 ? `baseline + ${komma(drempels.lt1.thr - drempels.lt1.baseline)}` : ''
  const lt2Sub = lt2Methode === 'moddmax' ? 'Modified-Dmax' : 'Dmax'
  const oblaSub = drempels.obla ? `${komma(drempels.obla.y)} mmol/L` : ''

  return (
    <div className="resultaten">
      {coef !== null && (
        <>
          <table className="resultaten__tabel">
            <tbody>
              <Drempelrij naam="LT1" sub={lt1Sub} sport={sport} punt={drempels.lt1} />
              <Drempelrij naam="LT2" sub={lt2Sub} sport={sport} punt={drempels.lt2} />
              <Drempelrij naam="OBLA" sub={oblaSub} sport={sport} punt={drempels.obla} />
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
  punt,
}: {
  naam: string
  sub: string
  sport: SportType
  punt: Point | null
}) {
  return (
    <tr>
      <th>
        {naam}
        <span className="drempel-sub">{sub}</span>
      </th>
      <td>{punt ? formatIntensiteit(sport, punt.x) : 'niet bereikt'}</td>
      <td>{punt ? `${punt.y.toFixed(1).replace('.', ',')} mmol/L` : '—'}</td>
    </tr>
  )
}
