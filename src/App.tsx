import { useMemo, useState, type ChangeEvent } from 'react'
import { Header } from './components/Header'
import { Intake } from './components/Intake'
import { Invoerpaneel } from './components/Invoerpaneel'
import { Grafiek } from './components/Grafiek'
import { Resultaten } from './components/Resultaten'
import { Zones } from './components/Zones'
import { AnalyseControls } from './components/AnalyseControls'
import { analyseer, type AnalyseConfig } from './lib/analyse'
import { parseIntensiteit, parseLactaat, parseHartslag, parseRpe, parseGewicht } from './lib/invoer'
import {
  legeSessie,
  naamGeldig,
  type Sessie,
  type LactaatModule,
  type Deelnemer,
  type TestMeta,
  type Rij,
} from './lib/sessie'
import { sessieNaarJson, jsonNaarSessie, bestandsnaam } from './lib/opslag'
import type { SportType } from './lib/types'
import './App.css'

function App() {
  // Eén bron van waarheid: de hele sessie (ADR-0014). In-sessie, niets opgeslagen (ADR-0001).
  const [sessie, setSessie] = useState<Sessie>(() =>
    legeSessie(new Date().toISOString().slice(0, 10)),
  )
  const [importFout, setImportFout] = useState<string | null>(null)

  // Afgeleide views voor de componenten (interfaces blijven gelijk).
  const { deelnemer } = sessie
  const sport = sessie.test.sport
  const testmeta: TestMeta = {
    datum: sessie.test.datum,
    testleider: sessie.test.testleider,
    notities: sessie.test.notities,
  }
  const lactaat = sessie.modules.lactaat!
  const { rust, meetpunten: rijen, analyseConfig: config } = lactaat
  const gewichtKg = parseGewicht(deelnemer.gewichtKg)

  const updateLactaat = (patch: Partial<LactaatModule>) =>
    setSessie((p) => ({
      ...p,
      modules: { ...p.modules, lactaat: { ...p.modules.lactaat!, ...patch } },
    }))
  const setSport = (s: SportType) => setSessie((p) => ({ ...p, test: { ...p.test, sport: s } }))
  const setDeelnemer = (d: Deelnemer) => setSessie((p) => ({ ...p, deelnemer: d }))
  const setTestmeta = (t: TestMeta) =>
    setSessie((p) => ({
      ...p,
      test: { ...p.test, datum: t.datum, testleider: t.testleider, notities: t.notities },
    }))
  const setRust = (v: string) => updateLactaat({ rust: v })
  const setRijen = (r: Rij[]) => updateLactaat({ meetpunten: r })
  const setConfig = (c: AnalyseConfig) => updateLactaat({ analyseConfig: c })

  // Opslaan/inladen als versioned JSON (ADR-0016) — client-side, geen server (ADR-0001).
  const exporteer = () => {
    const blob = new Blob([sessieNaarJson(sessie)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = bestandsnaam(sessie)
    a.click()
    URL.revokeObjectURL(url)
  }
  const importeer = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // zelfde bestand opnieuw kunnen kiezen
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = jsonNaarSessie(String(reader.result))
      if (res.ok) {
        setSessie(res.sessie)
        setImportFout(null)
      } else {
        setImportFout(res.fout)
      }
    }
    reader.readAsText(file)
  }

  const analyse = useMemo(() => {
    const rustVal = parseLactaat(rust)
    const stappen = rijen
      .map((r) => ({
        x: parseIntensiteit(sport, r.intensiteit),
        y: parseLactaat(r.lactaat),
        hf: parseHartslag(r.hf),
        rpe: parseRpe(r.rpe),
        uitgesloten: r.uitgesloten,
      }))
      .filter(
        (p): p is { x: number; y: number; hf: number | null; rpe: number | null; uitgesloten: boolean } =>
          p.x !== null && p.y !== null,
      )
    return analyseer({ rust: rustVal, stappen, config })
  }, [sport, rust, rijen, config])

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <div className="acties">
          <button
            type="button"
            className="knop-primair"
            onClick={exporteer}
            disabled={!naamGeldig(deelnemer.naam)}
          >
            Opslaan (.json)
          </button>
          <label className="knop-secundair acties__inladen">
            Inladen (.json)
            <input type="file" accept="application/json,.json" onChange={importeer} hidden />
          </label>
          {!naamGeldig(deelnemer.naam) && (
            <span className="acties__hint">Vul een naam in om op te slaan</span>
          )}
          {importFout && <span className="veld-fout">{importFout}</span>}
        </div>

        <section className="paneel">
          <header className="paneel__kop">
            <span className="paneel__nr">1</span>
            <h2>Intake</h2>
          </header>
          <Intake
            sport={sport}
            deelnemer={deelnemer}
            testmeta={testmeta}
            onDeelnemerChange={setDeelnemer}
            onTestMetaChange={setTestmeta}
          />
        </section>

        <section className="paneel">
          <header className="paneel__kop">
            <span className="paneel__nr">2</span>
            <h2>Meetpunten</h2>
          </header>
          <Invoerpaneel
            sport={sport}
            rust={rust}
            rijen={rijen}
            onSportChange={setSport}
            onRustChange={setRust}
            onRijenChange={setRijen}
          />
        </section>

        <section className="paneel">
          <header className="paneel__kop">
            <span className="paneel__nr">3</span>
            <h2>Lactaatcurve &amp; drempels</h2>
          </header>
          <AnalyseControls config={config} graadAdvies={analyse.graadAdvies} onChange={setConfig} />
          <Grafiek sport={sport} analyse={analyse} />
          <Resultaten sport={sport} analyse={analyse} gewichtKg={gewichtKg} />
        </section>

        <section className="paneel">
          <header className="paneel__kop">
            <span className="paneel__nr">4</span>
            <h2>Trainingszones</h2>
          </header>
          <Zones sport={sport} analyse={analyse} gewichtKg={gewichtKg} />
        </section>
      </main>
      <footer className="app-footer">Hanze Inspanningslab · SportsFieldsLab Groningen</footer>
    </div>
  )
}

export default App
