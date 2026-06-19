import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Intake } from './components/Intake'
import { Invoerpaneel, legeRijen, type Rij } from './components/Invoerpaneel'
import { Grafiek } from './components/Grafiek'
import { Resultaten } from './components/Resultaten'
import { Zones } from './components/Zones'
import { AnalyseControls } from './components/AnalyseControls'
import { analyseer, STANDAARD_CONFIG, type AnalyseConfig } from './lib/analyse'
import { parseIntensiteit, parseLactaat, parseHartslag } from './lib/invoer'
import { legeDeelnemer, legeTestMeta, type Deelnemer, type TestMeta } from './lib/sessie'
import type { SportType } from './lib/types'
import './App.css'

function App() {
  const [sport, setSport] = useState<SportType>('cycling')
  const [deelnemer, setDeelnemer] = useState<Deelnemer>(legeDeelnemer)
  const [testmeta, setTestmeta] = useState<TestMeta>(() =>
    legeTestMeta(new Date().toISOString().slice(0, 10)),
  )
  const [rust, setRust] = useState('')
  const [rijen, setRijen] = useState<Rij[]>(() => legeRijen(5))
  const [config, setConfig] = useState<AnalyseConfig>(STANDAARD_CONFIG)

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
          <Resultaten sport={sport} analyse={analyse} />
        </section>

        <section className="paneel">
          <header className="paneel__kop">
            <span className="paneel__nr">4</span>
            <h2>Trainingszones</h2>
          </header>
          <Zones sport={sport} analyse={analyse} />
        </section>
      </main>
      <footer className="app-footer">Hanze Inspanningslab · SportsFieldsLab Groningen</footer>
    </div>
  )
}

export default App
