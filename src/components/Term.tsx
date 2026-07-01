// Aanklikbare vakterm: toont een korte uitleg uit de WOORDENLIJST (ADR-0021, lab-eigen tekst).
// Toegankelijk: knop met aria-expanded, sluit op Escape en klik-buiten. Geen externe library.

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { WOORDENLIJST } from '../lib/rapporttekst'
import './Term.css'

export function Term({ k, children }: { k: string; children: ReactNode }) {
  const uitleg = WOORDENLIJST[k]
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const popId = useId().replace(/:/g, '')

  useEffect(() => {
    if (!open) return
    const klikBuiten = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const opEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', klikBuiten)
    document.addEventListener('keydown', opEscape)
    return () => {
      document.removeEventListener('pointerdown', klikBuiten)
      document.removeEventListener('keydown', opEscape)
    }
  }, [open])

  if (!uitleg) return <>{children}</>

  return (
    <span className="term" ref={wrapRef}>
      <button
        type="button"
        className="term__btn"
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((o) => !o)}
      >
        {children}
        <sup className="term__i" aria-hidden="true">
          ?
        </sup>
      </button>
      {open && (
        <span className="term__pop" id={popId} role="tooltip">
          <strong className="term__pop-kop">{k}</strong>
          {uitleg}
        </span>
      )}
    </span>
  )
}
