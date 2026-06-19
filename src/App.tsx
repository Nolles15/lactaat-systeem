import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Invoerpaneel, legeRijen, type Rij } from './components/Invoerpaneel'
import { Grafiek } from './components/Grafiek'
import { Resultaten } from './components/Resultaten'
import { Zones } from './components/Zones'
import { analyseer } from './lib/analyse'
import { parseIntensiteit, parseLactaat } from './lib/invoer'
import type { Point, SportType } from './lib/types'
import './App.css'

function App() {
  const [sport, setSport] = useState<SportType>('cycling')
  const [rust, setRust] = useState('')
  const [rijen, setRijen] = useState<Rij[]>(() => legeRijen(5))

  const analyse = useMemo(() => {
    const rustVal = parseLactaat(rust)
    const stappen = rijen
      .map((r) => ({ x: parseIntensiteit(sport, r.intensiteit), y: parseLactaat(r.lactaat) }))
      .filter((p): p is Point => p.x !== null && p.y !== null)
    return analyseer({ rust: rustVal, stappen })
  }, [sport, rust, rijen])

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Invoerpaneel
          sport={sport}
          rust={rust}
          rijen={rijen}
          onSportChange={setSport}
          onRustChange={setRust}
          onRijenChange={setRijen}
        />
        <section className="paneel">
          <h2>Lactaatcurve &amp; drempels</h2>
          <Grafiek sport={sport} analyse={analyse} />
          <Resultaten sport={sport} analyse={analyse} />
        </section>
        <section className="paneel">
          <h2>Trainingszones</h2>
          <Zones sport={sport} analyse={analyse} />
        </section>
      </main>
      <footer className="app-footer">Hanze Inspanningslab · SportsFieldsLab Groningen</footer>
    </div>
  )
}

export default App
