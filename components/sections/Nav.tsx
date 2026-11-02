/* Nav — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Nav() {
  return (
      <header data-k="nav" className="nav">
        <a href="#top" className="logo" aria-label="HODL home">
          <span className="logo-hex" />
          HODL
          <small className="hide-sm">UNTIL DEATH</small>
        </a>
        <div className="nav-r">
          <button data-k="sell" className="chip sell hide-sm" type="button" aria-label="Sell (you can't)"><s>SELL</s></button>
          <button data-k="sound" className="chip" type="button" aria-pressed="false" aria-label="Toggle sound">
            <span className="snd-bars">
              <i />
              <i />
              <i />
            </span>
            <span data-k="soundlbl" className="hide-sm">SOUND OFF</span>
          </button>
          <a href="https://clashpad.fun/coin.html?c=hodl" target="_blank" rel="noopener" className="chip chip-or hide-sm" data-burst="">BUY HODL</a>
          <button data-k="menubtn" className="chip menubtn" type="button" aria-expanded="false" aria-controls="hodl-menu">
            <span className="burger">
              <i />
              <i />
              <i />
            </span>
            MENU
          </button>
        </div>
      </header>
  );
}
