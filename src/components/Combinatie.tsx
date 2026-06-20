import type { Analyse } from '../lib/analyse'
import type { Vo2maxModule } from '../lib/sessie'
import type { SportType, Point } from '../lib/types'
import { formatIntensiteit } from '../lib/invoer'

interface Props {
  sport: SportType
  gewichtKg: number | null
  analyse: Analyse
  vo2max: Vo2maxModule
}

const bpm = (n: number | null) => (n !== null ? `${Math.round(n)} bpm` : '—')

function vo2Cel(vt: { vo2LPerMin: number | null; vo2MlPerKgMin: number | null; hr: number | null }): string {
  if (vt.vo2LPerMin === null) return '—'
  const l = `${vt.vo2LPerMin.toFixed(2).replace('.', ',')} L/min`
  const kg = vt.vo2MlPerKgMin !== null ? ` · ${Math.round(vt.vo2MlPerKgMin)} ml/kg/min` : ''
  const hr = vt.hr !== null ? ` · ${bpm(vt.hr)}` : ''
  return l + kg + hr
}

export function Combinatie({ sport, gewichtKg, analyse, vo2max }: Props) {
  const { drempels, hr } = analyse
  const lacCel = (punt: Point | null, h: number | null) =>
    punt ? `${formatIntensiteit(sport, punt.x, gewichtKg)}${h !== null ? ` · ${bpm(h)}` : ''}` : '—'

  return (
    <div className="combinatie">
      <p className="paneel__tekst">
        De aerobe (LT1 / VT1) en anaerobe (LT2 / VT2) drempels uit beide testen naast elkaar —
        zo zijn de conclusies van de lactaat- en de VO₂max-test verbonden.
      </p>
      <table className="resultaten__tabel">
        <thead>
          <tr>
            <th>Drempel</th>
            <th>Lactaat</th>
            <th>VO₂max</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              Aeroob<span className="drempel-sub">LT1 / VT1</span>
            </th>
            <td>{lacCel(drempels.lt1, hr.lt1)}</td>
            <td>{vo2Cel(vo2max.vt1)}</td>
          </tr>
          <tr>
            <th>
              Anaeroob<span className="drempel-sub">LT2 / VT2</span>
            </th>
            <td>{lacCel(drempels.lt2, hr.lt2)}</td>
            <td>{vo2Cel(vo2max.vt2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
