/* Nav — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
import { GAME_URL } from '@/data/links';

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
            <span className="snd-bars hide-sm">
              <i />
              <i />
              <i />
            </span>
            <svg className="snd-ico show-sm" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
              <path className="snd-w" d="M16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11" />
              <path className="snd-x" d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
            </svg>
            <span data-k="soundlbl" className="hide-sm">SOUND OFF</span>
          </button>
          <a href={GAME_URL} target="_blank" rel="noopener" className="chip chip-solid" data-burst="">
            <span className="hide-sm">Download the game</span>
            <span className="show-sm">Game</span>
            ↓
          </a>
          <a href="https://clashpad.fun/coin.html?c=hodl" target="_blank" rel="noopener" className="chip chip-or hide-sm" data-burst="">BUY HODL</a>
          <button data-k="menubtn" className="chip menubtn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="hodl-menu">
            <span className="burger">
              <i />
              <i />
              <i />
            </span>
            <span className="menulbl">MENU</span>
          </button>
        </div>
      </header>
  );
}
