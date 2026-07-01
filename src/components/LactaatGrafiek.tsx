// Custom geannoteerde, interactieve lactaatcurve (Slice 3c — design-elevation). Eigen inline SVG
// i.p.v. Recharts: annotatielaag (drempellijnen + labels + actieve titel), zone-banden, en een
// sleepbare scrubber. De afgelezen waarden komen UITSLUITEND uit `evalueerOpIntensiteit` (echte
// fit + geïnterpoleerde HR; geen verzonnen data — ADR-0019). Toegankelijk via een range-slider.

import { useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { evalueerOpIntensiteit, type RapportModel } from '../lib/rapportmodel'
import { formatIntensiteit } from '../lib/invoer'
import './LactaatGrafiek.css'

const W = 840
const H = 460
const PAD = { top: 44, right: 28, bottom: 52, left: 60 }

const ZONE_KLEUR: Record<string, string> = {
  A1: 'var(--hanze-donkerblauw)',
  A2: 'var(--hanze-donkergroen)',
  'A2+': 'var(--hanze-lichtgroen)',
  B: 'var(--kleur-accent)',
  C: 'var(--hanze-paars)',
}

const een = (n: number) => n.toFixed(1).replace('.', ',')

export function LactaatGrafiek({ model }: { model: RapportModel }) {
  const uid = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)
  const lactaat = model.lactaat

  const geo = useMemo(() => {
    if (!lactaat?.analyse.coef || lactaat.analyse.curve.length === 0) return null
    const curve = lactaat.analyse.curve
    const minX = curve[0].x
    const maxX = curve[curve.length - 1].x
    const meet = lactaat.analyse.meetpunten.filter((p) => p.x >= minX)
    const yMax = Math.max(12, ...meet.map((p) => p.y), ...curve.map((p) => p.y))
    const sx = (x: number) => PAD.left + ((x - minX) / (maxX - minX)) * (W - PAD.left - PAD.right)
    const sy = (y: number) => H - PAD.bottom - (Math.max(0, y) / yMax) * (H - PAD.top - PAD.bottom)
    const pad = (s: string) =>
      curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ') + s
    return { curve, minX, maxX, meet, yMax, sx, sy, linePath: pad(''), areaPath: pad(` L ${sx(maxX).toFixed(1)} ${sy(0).toFixed(1)} L ${sx(minX).toFixed(1)} ${sy(0).toFixed(1)} Z`) }
  }, [lactaat])

  const lt2x = lactaat?.drempels.find((d) => d.code === 'LT2')?.intensiteit
  const [scrubX, setScrubX] = useState<number>(() => lt2x ?? (geo ? (geo.minX + geo.maxX) / 2 : 0))

  if (!geo || !lactaat) return null
  const { minX, maxX, sx, sy, yMax } = geo

  const clamp = (x: number) => Math.min(maxX, Math.max(minX, x))
  const pointerNaarX = (clientX: number): number => {
    const rect = svgRef.current!.getBoundingClientRect()
    const vbX = ((clientX - rect.left) / rect.width) * W
    return clamp(minX + ((vbX - PAD.left) / (W - PAD.left - PAD.right)) * (maxX - minX))
  }
  const onDrag = (e: ReactPointerEvent) => {
    if (e.buttons === 0 && e.type !== 'pointerdown') return
    setScrubX(pointerNaarX(e.clientX))
  }

  const punt = evalueerOpIntensiteit(model, scrubX)
  const lt2 = lactaat.drempels.find((d) => d.code === 'LT2')
  const bovenDrempel = lt2 != null && scrubX > lt2.intensiteit
  const actieveTitel = bovenDrempel
    ? `Boven ${formatIntensiteit(model.test.sport, lt2!.intensiteit, null)} stapelt je lactaat zich sneller op`
    : 'Tot je drempel blijft je lactaat in balans'

  const yTicks = [0, 2, 4, 6, 8, 10, 12].filter((t) => t <= yMax)
  const xStep = maxX - minX > 200 ? 40 : 20
  const xTicks: number[] = []
  for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) xTicks.push(x)

  return (
    <figure className="lac">
      <figcaption className="lac__titel" aria-live="polite">
        {actieveTitel}
      </figcaption>

      <svg
        ref={svgRef}
        className="lac__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Interactieve lactaatcurve; sleep om waarden af te lezen"
        onPointerDown={onDrag}
        onPointerMove={onDrag}
      >
        <defs>
          <linearGradient id={`vul${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--kleur-accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--kleur-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* zone-banden */}
        {lactaat.trainingszones.map((z) => {
          const a = Math.max(z.min ?? minX, minX)
          const b = Math.min(z.max ?? maxX, maxX)
          if (b <= a) return null
          return (
            <rect
              key={z.code}
              x={sx(a)}
              y={PAD.top}
              width={sx(b) - sx(a)}
              height={H - PAD.top - PAD.bottom}
              fill={ZONE_KLEUR[z.code] ?? 'var(--grijs-50)'}
              opacity={0.07}
            />
          )
        })}

        {/* assen */}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={PAD.left} y1={sy(t)} x2={W - PAD.right} y2={sy(t)} stroke="var(--kleur-rand)" />
            <text x={PAD.left - 10} y={sy(t) + 4} textAnchor="end" className="lac__as">
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} x={sx(t)} y={H - PAD.bottom + 22} textAnchor="middle" className="lac__as">
            {Math.round(t)}
          </text>
        ))}
        <text x={PAD.left - 44} y={PAD.top - 18} className="lac__askop">
          mmol/L
        </text>
        <text x={W - PAD.right} y={H - 12} textAnchor="end" className="lac__askop">
          {model.test.sport === 'running' ? 'snelheid (km/u)' : 'vermogen (W)'}
        </text>

        {/* curve */}
        <path d={geo.areaPath} fill={`url(#vul${uid})`} />
        <path d={geo.linePath} className="lac__curve" pathLength={1} fill="none" stroke="var(--kleur-accent)" strokeWidth={3} />

        {/* drempellijnen */}
        {lactaat.drempels.map((d) => (
          <g key={d.code}>
            <line
              x1={sx(d.intensiteit)}
              y1={PAD.top}
              x2={sx(d.intensiteit)}
              y2={H - PAD.bottom}
              stroke="var(--grijs-80)"
              strokeWidth={1.5}
              strokeDasharray={d.code === 'OBLA' ? '3 3' : undefined}
            />
            <g transform={`translate(${sx(d.intensiteit)}, ${d.code === 'OBLA' ? PAD.top + 16 : PAD.top - 8})`}>
              <rect x={-20} y={-16} width={40} height={18} fill={d.code === 'OBLA' ? 'var(--grijs-60)' : 'var(--grijs-90)'} />
              <text x={0} y={-3} textAnchor="middle" className="lac__drempel">
                {d.code}
              </text>
            </g>
          </g>
        ))}

        {/* gemeten punten */}
        {geo.meet.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill="var(--hanze-wit)" stroke="var(--grijs-90)" strokeWidth={2} />
        ))}

        {/* scrubber */}
        <g className="lac__scrub" transform={`translate(${sx(scrubX)}, 0)`}>
          <line x1={0} y1={PAD.top} x2={0} y2={H - PAD.bottom} stroke="var(--hanze-zwart)" strokeWidth={2} />
          {punt?.lactaat != null && <circle cx={0} cy={sy(punt.lactaat)} r={6} fill="var(--hanze-zwart)" />}
          <polygon points="-6,38 6,38 0,46" fill="var(--hanze-zwart)" />
        </g>
      </svg>

      {/* readout + toegankelijke slider */}
      <div className="lac__readout">
        <div className="lac__r">
          <span className="lac__r-label">Intensiteit</span>
          <span className="lac__r-waarde">{formatIntensiteit(model.test.sport, scrubX, null)}</span>
        </div>
        <div className="lac__r">
          <span className="lac__r-label">Lactaat</span>
          <span className="lac__r-waarde">{punt?.lactaat != null ? `${een(punt.lactaat)} mmol/L` : '—'}</span>
        </div>
        <div className="lac__r">
          <span className="lac__r-label">Hartslag</span>
          <span className="lac__r-waarde">{punt?.hr != null ? `${Math.round(punt.hr)} bpm` : '—'}</span>
        </div>
        <div className="lac__r">
          <span className="lac__r-label">Zone</span>
          <span className="lac__r-waarde" data-zone={punt?.zone ?? ''}>
            {punt?.zone ?? '—'}
          </span>
        </div>
      </div>
      <label className="lac__slider">
        <span className="sr-only">Sleep over de curve</span>
        <input
          type="range"
          min={minX}
          max={maxX}
          step={1}
          value={Math.round(scrubX)}
          onChange={(e) => setScrubX(Number(e.target.value))}
          aria-valuetext={`${formatIntensiteit(model.test.sport, scrubX, null)}, ${
            punt?.lactaat != null ? `${een(punt.lactaat)} millimol per liter` : 'buiten bereik'
          }`}
        />
      </label>
    </figure>
  )
}
