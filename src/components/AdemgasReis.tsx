// De ademgas-reis (ADR-0027): scrollytelling voor het ademgas-deel, mijlpaal-vorm. Ademgas heeft
// géén doorlopende curve (VO₂ is niet per Watt af te leiden — ADR-0019), dus in plaats van een
// sleepbare curve tonen we een sticky VO₂-"ladder" die zich opbouwt, met VT1/VT2 en de piek als
// écht gemeten markeringen die oplichten terwijl je door de stappen scrolt. Tekst uit de
// template-laag (ADR-0021); alleen gemeten waarden, niets verzonnen. Layout deelt RapportReis.css.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RapportModel } from '../lib/rapportmodel'
import { ademgasReisStappen } from '../lib/rapporttekst'
import './RapportReis.css'
import './AdemgasReis.css'

const W = 560
const H = 440
const PAD = { top: 40, right: 150, bottom: 44, left: 60 }
const BARX = PAD.left + 24
const BARW = 86

const heel = (n: number) => String(Math.round(n))

export function AdemgasReis({ model }: { model: RapportModel }) {
  const v = model.vo2max
  const [actief, setActief] = useState(0)
  const stapRefs = useRef<(HTMLDivElement | null)[]>([])

  const stappen = useMemo(() => ademgasReisStappen(model), [model])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = stapRefs.current.indexOf(e.target as HTMLDivElement)
            if (i >= 0) setActief(i)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    stapRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [stappen.length])

  if (!v || stappen.length === 0) return null

  const piek = v.vo2max.mlPerKgMin
  const vt1Lvl = v.vt1.vo2MlPerKgMin
  const vt2Lvl = v.vt2.vo2MlPerKgMin
  const niveaus = [piek, vt1Lvl, vt2Lvl].filter((n): n is number => n != null)
  const vMax = (niveaus.length ? Math.max(...niveaus) : 60) * 1.14
  const sy = (val: number) => H - PAD.bottom - (Math.max(0, val) / vMax) * (H - PAD.top - PAD.bottom)
  const barTop = piek ?? (niveaus.length ? Math.max(...niveaus) : 0)

  const stapIndex = (kop: string) => stappen.findIndex((s) => s.kop === kop)
  const vt1Stap = stapIndex('Je eerste ademomslag')
  const vt2Stap = stapIndex('Je tweede ademomslag')

  const ticks: number[] = []
  const step = vMax > 50 ? 15 : 10
  for (let t = 0; t <= vMax; t += step) ticks.push(t)

  const marker = (lvl: number | null, aan: boolean, kleur: string, label: string, sub: string) => {
    if (lvl == null) return null
    const y = sy(lvl)
    return (
      <g style={{ opacity: aan ? 1 : 0.16 }} className="reis__hl">
        <line x1={BARX} y1={y} x2={BARX + BARW + 8} y2={y} stroke={kleur} strokeWidth={2.5} />
        <circle cx={BARX + BARW} cy={y} r={4} fill={kleur} />
        <text x={BARX + BARW + 16} y={y - 3} className="ademreis__lbl" fill={kleur}>
          {label}
        </text>
        {sub && (
          <text x={BARX + BARW + 16} y={y + 14} className="ademreis__sub">
            {sub}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="reis">
      <div className="reis__graphic">
        <svg
          className="reis__svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Zuurstofopname met ventilatoire drempels, opgebouwd tijdens het lezen"
        >
          <defs>
            <linearGradient id="ademvul" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--kleur-accent)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--kleur-accent)" stopOpacity="0.32" />
            </linearGradient>
          </defs>

          {/* VO₂-as */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={BARX} y1={sy(t)} x2={BARX + BARW} y2={sy(t)} stroke="var(--kleur-rand)" />
              <text x={BARX - 10} y={sy(t) + 4} textAnchor="end" className="reis__as">
                {t}
              </text>
            </g>
          ))}
          <text x={BARX - 34} y={PAD.top - 16} className="reis__as">
            ml/kg/min
          </text>

          {/* VO₂-capaciteit (bouwt zich op) */}
          <rect
            className="ademreis__bar"
            x={BARX}
            y={sy(barTop)}
            width={BARW}
            height={sy(0) - sy(barTop)}
            fill="url(#ademvul)"
          />

          {/* mijlpalen: écht gemeten VO₂-niveaus + hartslag */}
          {marker(
            vt1Lvl,
            actief >= (vt1Stap < 0 ? 99 : vt1Stap),
            'var(--hanze-donkergroen)',
            'VT1',
            v.vt1.hr != null ? `${heel(v.vt1.hr)} bpm` : '',
          )}
          {marker(
            vt2Lvl,
            actief >= (vt2Stap < 0 ? 99 : vt2Stap),
            'var(--kleur-accent)',
            'VT2',
            v.vt2.hr != null ? `${heel(v.vt2.hr)} bpm` : '',
          )}
          {marker(
            piek,
            true,
            'var(--hanze-zwart)',
            piek != null ? `VO₂max ${heel(piek)}` : 'VO₂max',
            v.vo2max.hrPiek != null ? `piek ${heel(v.vo2max.hrPiek)} bpm` : '',
          )}
        </svg>
      </div>

      <div className="reis__stappen">
        {stappen.map((s, i) => (
          <div
            key={s.kop}
            className={`reis__stap${actief === i ? ' is-actief' : ''}`}
            ref={(el) => {
              stapRefs.current[i] = el
            }}
          >
            <span className="reis__nr">{i + 1}</span>
            <h3 className="reis__kop">{s.kop}</h3>
            <p className="reis__tekst">{s.tekst}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
