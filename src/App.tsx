import { Header } from './components/Header'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <section className="paneel">
          <h2>Welkom</h2>
          <p className="paneel__tekst">
            Dit is het skelet van de lactaattest-app. De volgende stappen voegen de invoer,
            de lactaatcurve, de drempelwaarden (LT1, LT2, OBLA) en de trainingszones toe.
          </p>
        </section>
      </main>
      <footer className="app-footer">
        Hanze Inspanningslab · SportsFieldsLab Groningen
      </footer>
    </div>
  )
}

export default App
