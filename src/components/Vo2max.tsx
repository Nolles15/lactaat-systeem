import type { Vo2maxModule } from '../lib/sessie'

const g = (n: number | null, d = 2) => (n !== null ? n.toFixed(d).replace('.', ',') : '—')
const i = (n: number | null) => (n !== null ? `${Math.round(n)}` : '—')

export function Vo2max({ module }: { module: Vo2maxModule }) {
  const { vo2max, vt1, vt2, veVco2, bron } = module
  return (
    <div className="vo2max">
      <table className="resultaten__tabel">
        <thead>
          <tr>
            <th>Maat</th>
            <th>VO₂ (L/min)</th>
            <th>VO₂ (ml/kg/min)</th>
            <th>Hartslag</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              VO₂max/peak
              <span className="drempel-sub">
                {vo2max.pctVoorspeld !== null ? `${i(vo2max.pctVoorspeld)}% voorspeld` : 'piek'}
              </span>
            </th>
            <td>{g(vo2max.lPerMin)}</td>
            <td>{i(vo2max.mlPerKgMin)}</td>
            <td>{i(vo2max.hrPiek)} bpm</td>
          </tr>
          <tr>
            <th>
              VT1<span className="drempel-sub">aerobe drempel</span>
            </th>
            <td>{g(vt1.vo2LPerMin)}</td>
            <td>{i(vt1.vo2MlPerKgMin)}</td>
            <td>{i(vt1.hr)} bpm</td>
          </tr>
          <tr>
            <th>
              VT2 (RCP)<span className="drempel-sub">anaerobe drempel</span>
            </th>
            <td>{g(vt2.vo2LPerMin)}</td>
            <td>{i(vt2.vo2MlPerKgMin)}</td>
            <td>{i(vt2.hr)} bpm</td>
          </tr>
        </tbody>
      </table>
      <p className="resultaten__meta">
        V'E/V'CO₂ — bij VT2: {g(veVco2.vt2, 1)} · piek: {g(veVco2.piek, 1)} · bron: {bron.apparaat}
        {bron.bestand ? ` (${bron.bestand})` : ''}
      </p>
    </div>
  )
}
