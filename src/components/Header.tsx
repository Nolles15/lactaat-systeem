import logo from '../assets/hanze-logo.svg'

/**
 * App-header met het Hanze-logo (briefing 3.5). Presentatie-licht: alle
 * styling via tokens/klassen in App.css, zodat een latere restyle goedkoop is.
 */
export function Header() {
  return (
    <header className="app-header">
      <img
        className="app-header__logo"
        src={logo}
        alt="Hanze University of Applied Sciences Groningen"
      />
      <div className="app-header__titel">
        <span className="app-header__product">Lactaattest</span>
        <span className="app-header__sub">Inspanningslab · SportsFieldsLab Groningen</span>
      </div>
    </header>
  )
}
