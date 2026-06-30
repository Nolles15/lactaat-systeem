// De "reis" (Slice 3d): scrollytelling. De lactaatcurve blijft staan (sticky) terwijl je door de
// stappen scrolt, en bouwt zich stap voor stap op: curve → aerobe drempel → anaerobe drempel →
// zones. Geleide verhaalvorm — het rapport leidt je, in plaats van alles tegelijk te tonen.
// Tekst komt uit de template-laag (ADR-0021); geen verzonnen data.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RapportModel } from '../lib/rapportmodel'
import { curveBeschrijving, drempelBetekenis } from '../lib/rapporttekst'
import './RapportReis.css'

const W = 720
const H = 440
const PAD = { top: 40, right: 24, bottom: 48, left: 56 }

const ZONE_KLEUR: Record<string, string> = {
  A1: 'var(--hanze-donkerblauw)',
  A2: 'var(--hanze-donkergroen)',
  'A2+': 'var(--hanze-lichtgroen)',
  B: 'var(--kleur-accent)',
  C: 'var(--hanze-paars)',
}

export function RapportReis({ model }: { model: RapportModel }) {
  const lactaat = model.lactaat
  const [actief, setActief] = useState(0)
  const stapRefs = useRef<(HTMLDivElement | null)[]>([])

  const geo = useMemo(() => {
    if (!lactaat?.analyse.coef || lactaat.analyse.curve.length === 0) return null
    const curve = lactaat.analyse.curve
    const minX = curve[0].x
    const maxX = curve[curve.length - 1].x
    const meet = lactaat.analyse.meetpunten.filter((p) => p.x >= minX)
    const yMax = Math.max(12, ...meet.map((p) => p.y), ...curve.map((p) => p.y))
    const sx = (x: number) => PAD.left + ((x - minX) / (maxX - minX)) * (W - PAD.left - PAD.right)
    const sy = (y: number) => H - PAD.bottom - (Math.max(0, y) / yMax) * (H - PAD.top - PAD.bottom)
    const linePath = curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ')
    return { curve, minX, maxX, meet, yMax, sx, sy, linePath }
  }, [lactaat])

  const stappen = useMemo(() => {
    if (!lactaat) return []
    const lt1 = lactaat.drempels.find((d) => d.code === 'LT1')
    const lt2 = lactaat.drempels.find((d) => d.code === 'LT2')
    return [
      { kop: 'Je inspanningscurve', tekst: curveBeschrijving(model) ?? 'Bij elke stap zwaarder meten we je lactaat; samen vormen die punten je curve.' },
      ...(lt1 ? [{ kop: 'Je eerste drempel', tekst: drempelBetekenis(model, 'LT1')! }] : []),
      ...(lt2 ? [{ kop: 'Je tweede drempel', tekst: drempelBetekenis(model, 'LT2')! }] : []),
      { kop: 'Je trainingszones', tekst: 'Rond en tussen je drempels liggen je trainingszones. Hieronder staan ze precies uitgewerkt, met hartslag en betekenis.' },
    ]
  }, [lactaat, model])

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

  if (!geo || !lactaat) return null
  const { minX, maxX, sx, sy } = geo
  const lt1 = lactaat.drempels.find((d) => d.code === 'LT1')
  const lt2 = lactaat.drempels.find((d) => d.code === 'LT2')
  // Stap-index waarop een drempel/zones oplichten (afhankelijk van welke stappen bestaan).
  const lt1Stap = 1
  const lt2Stap = lt1 ? 2 : 1
  const zoneStap = stappen.length - 1

  const drempelMarker = (x: number, kleur: string, code: string, aan: boolean) => (
    <g style={{ opacity: aan ? 1 : 0 }} className="reis__hl">
      <line x1={sx(x)} y1={PAD.top} x2={sx(x)} y2={H - PAD.bottom} stroke={kleur} strokeWidth={2} />
      <g transform={`translate(${sx(x)}, ${PAD.top - 6})`}>
        <rect x={-19} y={-17} width={38} height={18} fill={kleur} />
        <text x={0} y={-4} textAnchor="middle" className="reis__drempeltxt">{code}</text>
      </g>
    </g>
  )

  return (
    <div className="reis">
      <div className="reis__graphic">
        <svg className="reis__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Lactaatcurve die zich opbouwt tijdens het lezen">
          {/* zone-banden (verschijnen bij de zone-stap) */}
          {lactaat.trainingszones.map((z) => {
            const a = Math.max(z.min ?? minX, minX)
            const b = Math.min(z.max ?? maxX, maxX)
            if (b <= a) return null
            return (
              <rect key={z.code} className="reis__hl" x={sx(a)} y={PAD.top} width={sx(b) - sx(a)} height={H - PAD.top - PAD.bottom}
                fill={ZONE_KLEUR[z.code] ?? 'var(--grijs-50)'} style={{ opacity: actief >= zoneStap ? 0.1 : 0 }} />
            )
          })}

          {/* assen */}
          {[0, 4, 8, 12].filter((t) => t <= geo.yMax).map((t) => (
            <g key={t}>
              <line x1={PAD.left} y1={sy(t)} x2={W - PAD.right} y2={sy(t)} stroke="var(--kleur-rand)" />
              <text x={PAD.left - 8} y={sy(t) + 4} textAnchor="end" className="reis__as">{t}</text>
            </g>
          ))}
          <text x={PAD.left - 40} y={PAD.top - 16} className="reis__as">mmol/L</text>

          {/* curve + area */}
          <path d={`${geo.linePath} L ${sx(maxX)} ${sy(0)} L ${sx(minX)} ${sy(0)} Z`} fill="var(--kleur-accent)" opacity={0.08} />
          <path className="reis__curve" d={geo.linePath} pathLength={1} fill="none" stroke="var(--kleur-accent)" strokeWidth={3} />

          {/* gemeten punten */}
          {geo.meet.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="var(--hanze-wit)" stroke="var(--grijs-90)" strokeWidth={2} />
          ))}

          {/* drempel-highlights */}
          {lt1 && drempelMarker(lt1.intensiteit, 'var(--hanze-donkergroen)', 'LT1', actief >= lt1Stap)}
          {lt2 && drempelMarker(lt2.intensiteit, 'var(--kleur-accent)', 'LT2', actief >= lt2Stap)}
          {lt2 && (
            <rect className="reis__hl" x={sx(lt2.intensiteit)} y={PAD.top} width={sx(maxX) - sx(lt2.intensiteit)} height={H - PAD.top - PAD.bottom}
              fill="var(--kleur-accent)" style={{ opacity: actief >= lt2Stap ? 0.08 : 0 }} />
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
