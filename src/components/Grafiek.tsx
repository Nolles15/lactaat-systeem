import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { SportType } from '../lib/types'
import type { Analyse } from '../lib/analyse'
import { kmhToPace } from '../lib/rekenkern'

// Hex i.p.v. CSS-vars: SVG-presentatieattributen resolven var() niet betrouwbaar.
const ORANJE = '#ee7f00'
const BLAUW = '#578494'
const GROEN = '#628c5f'
const PAARS = '#9e6697'
const GEEL = '#caa500'
const RAND = '#e3e4de'
const GRIJS = '#9aa0a6'

function xTick(sport: SportType, x: number): string {
  // Rust (x=0) hoort niet op de intensiteit-as; pace van 0 km/u is oneindig.
  if (!Number.isFinite(x) || x <= 0) return ''
  return sport === 'running' ? kmhToPace(x) : `${Math.round(x)}`
}

interface Props {
  sport: SportType
  analyse: Analyse
}

export function Grafiek({ sport, analyse }: Props) {
  const { curve, meetpunten, drempels, coef } = analyse
  if (coef === null || curve.length === 0) {
    return <p className="leeg-melding">Voer minimaal 3 belastingsstappen in voor een curve.</p>
  }

  const dmaxStart = curve[0]
  const dmaxEind = curve[curve.length - 1]
  // De ruststap (x=0) is baseline/tabel, niet de intensiteit-as (ADR-0008).
  const scatterPunten = meetpunten.filter((p) => p.x > 0)

  // LT2-label alleen verhogen als het dicht op LT1 ligt (anders gelijk uitlijnen).
  const reeksBreedte = dmaxEind.x - dmaxStart.x || 1
  const drempelsDicht =
    drempels.lt1 !== null &&
    drempels.lt2 !== null &&
    Math.abs(drempels.lt2.x - drempels.lt1.x) / reeksBreedte < 0.09
  const lt2Offset = drempelsDicht ? 22 : 6

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={curve} margin={{ top: 36, right: 24, bottom: 24, left: 8 }}>
        <CartesianGrid stroke={RAND} />
        <XAxis
          type="number"
          dataKey="x"
          domain={[dmaxStart.x, dmaxEind.x]}
          allowDataOverflow
          tickFormatter={(x) => xTick(sport, x as number)}
          label={{
            value: sport === 'running' ? 'Tempo (min/km)' : 'Vermogen (W)',
            position: 'insideBottom',
            offset: -12,
          }}
        />
        <YAxis
          domain={[0, 'auto']}
          label={{ value: 'Lactaat (mmol/L)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(v) => [`${(v as number).toFixed(2)} mmol/L`, 'Lactaat']}
          labelFormatter={(x) => xTick(sport, x as number) + (sport === 'running' ? ' /km' : ' W')}
        />
        {/* D-max referentielijn (eerste→laatste gefitte punt). */}
        <ReferenceLine
          segment={[
            { x: dmaxStart.x, y: dmaxStart.y },
            { x: dmaxEind.x, y: dmaxEind.y },
          ]}
          stroke={GRIJS}
          strokeDasharray="4 4"
        />
        <Line
          type="monotone"
          dataKey="y"
          stroke={ORANJE}
          strokeWidth={2}
          dot={false}
          name="Curve"
          isAnimationActive={false}
        />
        <Scatter data={scatterPunten} dataKey="y" fill={BLAUW} name="Meting" isAnimationActive={false} />
        {drempels.lt1 && (
          <ReferenceLine
            x={drempels.lt1.x}
            stroke={GROEN}
            label={{ value: 'LT1', fill: GROEN, position: 'top', offset: 6, fontWeight: 'bold', fontSize: 12 }}
          />
        )}
        {drempels.lt2 && (
          <ReferenceLine
            x={drempels.lt2.x}
            stroke={PAARS}
            label={{ value: 'LT2', fill: PAARS, position: 'top', offset: lt2Offset, fontWeight: 'bold', fontSize: 12 }}
          />
        )}
        {drempels.obla && (
          <ReferenceLine
            x={drempels.obla.x}
            stroke={GEEL}
            label={{ value: 'OBLA', fill: GEEL, position: 'top', offset: 6, fontWeight: 'bold', fontSize: 12 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
