/* Menu — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
import { REINVEST_URL } from '@/data/links';

export default function Menu() {
  return (
    <>
      <div className="menu-scrim" data-close="" />
      <nav id="hodl-menu" data-k="menu" className="menu" aria-hidden="true" aria-label="Site menu">
        <div className="menu-head">
          <span>Garrison nav</span>
          <span>
            Vault{' '}
            <b>sealed</b>
          </span>
        </div>
        <ul className="menu-list">
          <li>
            <a href="#vault">
              <span>01</span>
              The Vault
            </a>
          </li>
          <li>
            <a href="#mechanics">
              <span>02</span>
              Buybacks &amp; Fees
            </a>
          </li>
          <li>
            <a href="#reinvest">
              <span>03</span>
              Auto-Reinvest
            </a>
          </li>
          <li>
            <a href="#collection">
              <span>04</span>
              The Collection
            </a>
          </li>
          <li>
            <a href="#community">
              <span>05</span>
              Community
            </a>
          </li>
          <li>
            <a href="#verify">
              <span>06</span>
              Verify
            </a>
          </li>
        </ul>
        <div className="menu-ext">
          <a className="chip chip-or" href="https://clashpad.fun/coin.html?c=hodl" target="_blank" rel="noopener">BUY HODL ↗</a>
          <a className="chip" href={REINVEST_URL} target="_blank" rel="noopener">REINVEST ↗</a>
          <a className="chip" href="https://hodluntildeath.myshopify.com/" target="_blank" rel="noopener">STORE ↗</a>
          <a className="chip" href="https://x.com/HODLUNTILDEATH" target="_blank" rel="noopener">X ↗</a>
          <a className="chip" href="https://www.instagram.com/hodluntildeath/" target="_blank" rel="noopener">INSTAGRAM ↗</a>
        </div>
        <div className="menu-foot">Press Esc to reopen the vault</div>
      </nav>
    </>
  );
}
