import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { Header } from './components/Header'
import { Intake } from './components/Intake'
import { Invoerpaneel } from './components/Invoerpaneel'
import { Grafiek } from './components/Grafiek'
import { Resultaten } from './components/Resultaten'
import { Zones } from './components/Zones'
import { Vo2max } from './components/Vo2max'
import { Combinatie } from './components/Combinatie'
import { Rapport } from './components/Rapport'
import { AnalyseControls } from './components/AnalyseControls'
import { bouwRapportModel } from './lib/rapportmodel'
import { analyseer, type AnalyseConfig } from './lib/analyse'
import { parseLactaat, parseGewicht, stappenUitRijen } from './lib/invoer'
import {
  legeSessie,
  naamGeldig,
  actieveModules,
  type Sessie,
  type LactaatModule,
  type Deelnemer,
  type TestMeta,
  type Rij,
} from './lib/sessie'
import { sessieNaarJson, jsonNaarSessie, bestandsnaam } from './lib/opslag'
import { parseCortexXml } from './lib/cortex'
import type { SportType } from './lib/types'
import './App.css'

function App() {
  const [sessie, setSessie] = useState<Sessie>(() =>
    legeSessie(new Date().toISOString().slice(0, 10)),
  )
  const [importFout, setImportFout] = useState<string | null>(null)
  const [toonRapport, setToonRapport] = useState(false)

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
  const actief = actieveModules(sessie)

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
  const zetActief = (mod: 'lactaat' | 'vo2max', val: boolean) =>
    setSessie((p) => ({ ...p, actief: { ...actieveModules(p), [mod]: val } }))

  // Opslaan/inladen (ADR-0016) — client-side, geen server (ADR-0001).
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
    e.target.value = ''
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
  // CPET-export (Cortex MetaSoft XML) inladen → vo2max-module + deelnemer (ADR-0017).
  const importeerCpet = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = parseCortexXml(String(reader.result), file.name)
      if (!res.ok) {
        setImportFout(res.fout)
        return
      }
      const d = res.data
      setSessie((p) => ({
        ...p,
        deelnemer: {
          ...p.deelnemer,
          naam: d.deelnemer.naam || p.deelnemer.naam,
          geslacht: d.deelnemer.geslacht || p.deelnemer.geslacht,
          geboortedatum: d.deelnemer.geboortedatum || p.deelnemer.geboortedatum,
          gewichtKg: d.deelnemer.gewichtKg || p.deelnemer.gewichtKg,
        },
        actief: { ...actieveModules(p), vo2max: true },
        modules: { ...p.modules, vo2max: d.vo2max },
      }))
      setImportFout(null)
    }
    reader.readAsText(file)
  }

  const analyse = useMemo(() => {
    const rustVal = parseLactaat(rust)
    const stappen = stappenUitRijen(rijen, sport)
    return analyseer({ rust: rustVal, stappen, config })
  }, [sport, rust, rijen, config])

  // Module-gestuurde secties, dynamisch genummerd (ADR-0018): toon alleen wat bij de test hoort.
  const secties: { titel: string; node: ReactNode }[] = [
    {
      titel: 'Intake',
      node: (
        <Intake
          sport={sport}
          deelnemer={deelnemer}
          testmeta={testmeta}
          onDeelnemerChange={setDeelnemer}
          onTestMetaChange={setTestmeta}
        />
      ),
    },
  ]
  if (actief.lactaat) {
    secties.push({
      titel: 'Meetpunten',
      node: (
        <Invoerpaneel
          sport={sport}
          rust={rust}
          rijen={rijen}
          onSportChange={setSport}
          onRustChange={setRust}
          onRijenChange={setRijen}
        />
      ),
    })
    secties.push({
      titel: 'Lactaatcurve & drempels',
      node: (
        <>
          <AnalyseControls config={config} graadAdvies={analyse.graadAdvies} onChange={setConfig} />
          <Grafiek sport={sport} analyse={analyse} />
          <Resultaten sport={sport} analyse={analyse} gewichtKg={gewichtKg} />
        </>
      ),
    })
    secties.push({
      titel: 'Trainingszones',
      node: <Zones sport={sport} analyse={analyse} gewichtKg={gewichtKg} />,
    })
  }
  if (actief.vo2max) {
    secties.push({
      titel: 'VO₂max',
      node: sessie.modules.vo2max ? (
        <Vo2max module={sessie.modules.vo2max} />
      ) : (
        <p className="leeg-melding">Importeer een CPET-bestand (.xml) om de VO₂max-resultaten te tonen.</p>
      ),
    })
  }
  if (actief.lactaat && actief.vo2max && sessie.modules.vo2max && analyse.drempels.lt1 && analyse.drempels.lt2) {
    secties.push({
      titel: 'Gecombineerde conclusie',
      node: <Combinatie sport={sport} gewichtKg={gewichtKg} analyse={analyse} vo2max={sessie.modules.vo2max} />,
    })
  }

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
          <label className="knop-secundair acties__inladen">
            Inladen CPET (.xml)
            <input type="file" accept=".xml,application/xml,text/xml" onChange={importeerCpet} hidden />
          </label>
          <button
            type="button"
            className={toonRapport ? 'knop-secundair' : 'knop-primair'}
            onClick={() => setToonRapport((v) => !v)}
          >
            {toonRapport ? '← Terug naar invoer' : 'Toon rapport'}
          </button>
          {!naamGeldig(deelnemer.naam) && (
            <span className="acties__hint">Vul een naam in om op te slaan</span>
          )}
          {importFout && <span className="veld-fout">{importFout}</span>}
        </div>

        {toonRapport && <Rapport model={bouwRapportModel(sessie)} />}

        {!toonRapport && (
        <>
        <div className="test-toggle" role="group" aria-label="Welke test(en)">
          <span className="test-toggle__label">Test:</span>
          <button
            type="button"
            className={actief.lactaat ? 'is-actief' : ''}
            aria-pressed={actief.lactaat}
            onClick={() => zetActief('lactaat', !actief.lactaat)}
          >
            Lactaat
          </button>
          <button
            type="button"
            className={actief.vo2max ? 'is-actief' : ''}
            aria-pressed={actief.vo2max}
            onClick={() => zetActief('vo2max', !actief.vo2max)}
          >
            VO₂max
          </button>
        </div>

        {secties.map((s, idx) => (
          <section className="paneel" key={s.titel}>
            <header className="paneel__kop">
              <span className="paneel__nr">{idx + 1}</span>
              <h2>{s.titel}</h2>
            </header>
            {s.node}
          </section>
        ))}
        </>
        )}
      </main>
      <footer className="app-footer">Hanze Inspanningslab · SportsFieldsLab Groningen</footer>
    </div>
  )
}

export default App
