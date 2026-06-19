import { useState } from 'react'
import { Header } from './components/Header'
import { Invoerpaneel, legeRijen, type Rij } from './components/Invoerpaneel'
import type { SportType } from './lib/types'
import './App.css'

function App() {
  const [sport, setSport] = useState<SportType>('cycling')
  const [rijen, setRijen] = useState<Rij[]>(() => legeRijen(5))

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Invoerpaneel
          sport={sport}
          rijen={rijen}
          onSportChange={setSport}
          onRijenChange={setRijen}
        />
      </main>
      <footer className="app-footer">Hanze Inspanningslab · SportsFieldsLab Groningen</footer>
    </div>
  )
}

export default App
