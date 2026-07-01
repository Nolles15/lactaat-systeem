// Sporter-viewer (Slice 5, Route A): een kale, ALLEEN-LEZEN pagina die de sporter opent via
// .../?rapport. De sporter laadt het JSON-bestand dat hij van het lab kreeg en ziet alléén het
// rapport — geen invoervelden. Volledig client-side; niets opgeslagen of verstuurd (ADR-0001).

import { useState, type ChangeEvent } from 'react'
import { Header } from './Header'
import { Rapport } from './Rapport'
import { jsonNaarSessie } from '../lib/opslag'
import { bouwRapportModel } from '../lib/rapportmodel'
import type { Sessie } from '../lib/sessie'
import './Viewer.css'

export function Viewer() {
  const [sessie, setSessie] = useState<Sessie | null>(null)
  const [fout, setFout] = useState<string | null>(null)

  const laad = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = jsonNaarSessie(String(reader.result))
      if (res.ok) {
        setSessie(res.sessie)
        setFout(null)
      } else {
        setSessie(null)
        setFout(res.fout)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <Header />
      <main className="viewer-main">
        {sessie ? (
          <>
            <Rapport model={bouwRapportModel(sessie)} />
            <div className="viewer-voet">
              <label className="knop-secundair">
                Ander bestand openen
                <input type="file" accept="application/json,.json" onChange={laad} hidden />
              </label>
            </div>
          </>
        ) : (
          <section className="viewer-intro">
            <span className="viewer-intro__eyebrow">Hanze SportsFieldsLab Groningen</span>
            <h1 className="viewer-intro__titel">Bekijk je testrapport</h1>
            <p className="viewer-intro__tekst">
              Open het bestand dat je van het lab hebt gekregen (een <code>.json</code>-bestand).
              Je rapport verschijnt dan hieronder — interactief, je kunt door je eigen curve slepen.
            </p>
            <label className="knop-primair viewer-intro__knop">
              Open je rapport (.json)
              <input type="file" accept="application/json,.json" onChange={laad} hidden />
            </label>
            {fout && <p className="viewer-intro__fout">{fout}</p>}
            <p className="viewer-intro__privacy">
              Je gegevens blijven in je eigen browser. Er wordt niets opgeslagen of verstuurd.
            </p>
          </section>
        )}
      </main>
      <footer className="app-footer">Hanze SportsFieldsLab Groningen</footer>
    </div>
  )
}
