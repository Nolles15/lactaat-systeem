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

function xTick(sport: SportType, x: number): string {
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

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={curve} margin={{ top: 8, right: 20, bottom: 24, left: 8 }}>
        <CartesianGrid stroke={RAND} />
        <XAxis
          type="number"
          dataKey="x"
          domain={['dataMin', 'dataMax']}
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
          stroke={PAARS}
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
        <Scatter data={meetpunten} dataKey="y" fill={BLAUW} name="Meting" isAnimationActive={false} />
        {drempels.lt1 && (
          <ReferenceLine x={drempels.lt1.x} stroke={GROEN} label={{ value: 'LT1', fill: GROEN }} />
        )}
        {drempels.lt2 && (
          <ReferenceLine x={drempels.lt2.x} stroke={PAARS} label={{ value: 'LT2', fill: PAARS }} />
        )}
        {drempels.obla && (
          <ReferenceLine x={drempels.obla.x} stroke={GEEL} label={{ value: 'OBLA', fill: GEEL }} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
