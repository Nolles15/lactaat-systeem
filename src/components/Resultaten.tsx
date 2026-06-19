import type { SportType, Point } from '../lib/types'
import type { Analyse } from '../lib/analyse'
import { formatIntensiteit } from '../lib/invoer'

interface Props {
  sport: SportType
  analyse: Analyse
}

export function Resultaten({ sport, analyse }: Props) {
  const { drempels, r2, graad, coef, waarschuwingen } = analyse

  return (
    <div className="resultaten">
      {coef !== null && (
        <>
          <table className="resultaten__tabel">
            <tbody>
              <Drempelrij naam="LT1" sub="baseline + 1,0" sport={sport} punt={drempels.lt1} />
              <Drempelrij naam="LT2" sub="D-max" sport={sport} punt={drempels.lt2} />
              <Drempelrij naam="OBLA" sub="4,0 mmol/L" sport={sport} punt={drempels.obla} />
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
