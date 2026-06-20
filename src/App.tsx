import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Intake } from './components/Intake'
import { Invoerpaneel } from './components/Invoerpaneel'
import { Grafiek } from './components/Grafiek'
import { Resultaten } from './components/Resultaten'
import { Zones } from './components/Zones'
import { AnalyseControls } from './components/AnalyseControls'
import { analyseer, type AnalyseConfig } from './lib/analyse'
import { parseIntensiteit, parseLactaat, parseHartslag, parseGewicht } from './lib/invoer'
import {
  legeSessie,
  type Sessie,
  type LactaatModule,
  type Deelnemer,
  type TestMeta,
  type Rij,
} from './lib/sessie'
import type { SportType } from './lib/types'
import './App.css'

function App() {
  // Eén bron van waarheid: de hele sessie (ADR-0014). In-sessie, niets opgeslagen (ADR-0001).
  const [sessie, setSessie] = useState<Sessie>(() =>
    legeSessie(new Date().toISOString().slice(0, 10)),
  )

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

  const analyse = useMemo(() => {
    const rustVal = parseLactaat(rust)
    const stappen = rijen
      .map((r) => ({
        x: parseIntensiteit(sport, r.intensiteit),
        y: parseLactaat(r.lactaat),
        hf: parseHartslag(r.hf),
        uitgesloten: r.uitgesloten,
      }))
      .filter(
        (p): p is { x: number; y: number; hf: number | null; uitgesloten: boolean } =>
          p.x !== null && p.y !== null,
      )
    return analyseer({ rust: rustVal, stappen, config })
  }, [sport, rust, rijen, config])

  return (
    <div className="app">
      <Header />
      <main className="app-main">
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
