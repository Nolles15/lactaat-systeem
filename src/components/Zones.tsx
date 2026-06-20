import type { SportType } from '../lib/types'
import type { Analyse } from '../lib/analyse'
import { drempelzones, trainingszones, zoneHr, type Zone } from '../lib/zones'
import { formatIntensiteit } from '../lib/invoer'

interface Props {
  sport: SportType
  analyse: Analyse
  gewichtKg: number | null
}

function bereik(sport: SportType, z: Zone, gewichtKg: number | null): string {
  const f = (x: number) => formatIntensiteit(sport, x, gewichtKg)
  if (z.min === null && z.max !== null) return `< ${f(z.max)}`
  if (z.max === null && z.min !== null) return `> ${f(z.min)}`
  if (z.min !== null && z.max !== null) return `${f(z.min)} – ${f(z.max)}`
  return '—'
}

function hrBereik(hfPunten: { x: number; v: number }[], z: Zone): string {
  const { min, max } = zoneHr(hfPunten, z)
  const bpm = (n: number | null) => (n !== null ? `${Math.round(n)}` : '—')
  if (z.min === null) return `< ${bpm(max)} bpm`
  if (z.max === null) return `> ${bpm(min)} bpm`
  return `${bpm(min)}–${bpm(max)} bpm`
}

export function Zones({ sport, analyse, gewichtKg }: Props) {
  const { lt1, lt2 } = analyse.drempels
  if (!lt1 || !lt2) {
    return <p className="leeg-melding">Trainingszones verschijnen zodra LT1 én LT2 bepaald zijn.</p>
  }
  const toonHF = analyse.hfPunten.length >= 2

  const tabel = (titel: string, zones: Zone[]) => (
    <>
      <h3>{titel}</h3>
      <ZoneTabel
        sport={sport}
        zones={zones}
        gewichtKg={gewichtKg}
        hfPunten={analyse.hfPunten}
        toonHF={toonHF}
      />
    </>
  )

  return (
    <div className="zones">
      {tabel('Drempelzones', drempelzones(lt1.x, lt2.x))}
      {tabel('Trainingszones', trainingszones(lt1.x, lt2.x))}
    </div>
  )
}

function ZoneTabel({
  sport,
  zones,
  gewichtKg,
  hfPunten,
  toonHF,
}: {
  sport: SportType
  zones: Zone[]
  gewichtKg: number | null
  hfPunten: { x: number; v: number }[]
  toonHF: boolean
}) {
  return (
    <table className="zone-tabel">
      <thead>
        <tr>
          <th className="zone-code">Zone</th>
          <th>Naam</th>
          <th>Intensiteit</th>
          {toonHF && <th>Hartslag</th>}
        </tr>
      </thead>
      <tbody>
        {zones.map((z) => (
          <tr key={z.code}>
            <td className="zone-code">{z.code}</td>
            <td>{z.naam}</td>
            <td>{bereik(sport, z, gewichtKg)}</td>
            {toonHF && <td>{hrBereik(hfPunten, z)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
