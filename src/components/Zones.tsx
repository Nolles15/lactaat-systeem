import type { SportType } from '../lib/types'
import type { Analyse } from '../lib/analyse'
import { drempelzones, trainingszones, type Zone } from '../lib/zones'
import { formatIntensiteit } from '../lib/invoer'

interface Props {
  sport: SportType
  analyse: Analyse
}

function bereik(sport: SportType, z: Zone): string {
  if (z.min === null && z.max !== null) return `< ${formatIntensiteit(sport, z.max)}`
  if (z.max === null && z.min !== null) return `> ${formatIntensiteit(sport, z.min)}`
  if (z.min !== null && z.max !== null)
    return `${formatIntensiteit(sport, z.min)} – ${formatIntensiteit(sport, z.max)}`
  return '—'
}

export function Zones({ sport, analyse }: Props) {
  const { lt1, lt2 } = analyse.drempels
  if (!lt1 || !lt2) {
    return (
      <p className="leeg-melding">Trainingszones verschijnen zodra LT1 én LT2 bepaald zijn.</p>
    )
  }

  return (
    <div className="zones">
      <h3>Drempelzones</h3>
      <ZoneTabel sport={sport} zones={drempelzones(lt1.x, lt2.x)} />
      <h3>Trainingszones</h3>
      <ZoneTabel sport={sport} zones={trainingszones(lt1.x, lt2.x)} />
    </div>
  )
}

function ZoneTabel({ sport, zones }: { sport: SportType; zones: Zone[] }) {
  return (
    <table className="zone-tabel">
      <thead>
        <tr>
          <th className="zone-code">Zone</th>
          <th>Naam</th>
          <th>Intensiteit</th>
        </tr>
      </thead>
      <tbody>
        {zones.map((z) => (
          <tr key={z.code}>
            <td className="zone-code">{z.code}</td>
            <td>{z.naam}</td>
            <td>{bereik(sport, z)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
