/* Footer — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
import { DISCORD_URL, INSTAGRAM_URL, TIKTOK_URL, X_URL } from '@/data/links';

export default function Footer() {
  return (
      <footer>
        <div className="wrap">
          <div className="foot">
            <div>
              <div className="logo" style={{ marginBottom: "12px" }}>
                <span className="logo-hex" />
                HODL
              </div>
              <p className="sub" style={{ fontSize: "13px" }}>
                Hold on for dear life.
                <br />
                We never sell.
              </p>
            </div>
            <div>
              <h4>Explore</h4>
              <a href="#vault">The Vault</a>
              <a href="#mechanics">Buybacks &amp; Fees</a>
              <a href="#reinvest">Auto-Reinvest</a>
              <a href="#community">Community</a>
            </div>
            <div>
              <h4>Official</h4>
              <a href="https://hodluntildeath.myshopify.com/" target="_blank" rel="noopener">Merch Store ↗</a>
              <a href="https://clashpad.fun/coin.html?c=hodl" target="_blank" rel="noopener">Project / Buy ↗</a>
              <a href={X_URL} target="_blank" rel="noopener">X ↗</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener">Instagram ↗</a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener">TikTok ↗</a>
              <a href={DISCORD_URL} target="_blank" rel="noopener">Discord ↗</a>
            </div>
          </div>
          <div className="foot-b">
            <span>© 2026 HODL</span>
            <span>
              Cryptocurrency involves risk. Informational content only, not financial advice. No guaranteed returns.
            </span>
            <a href="#top" style={{ color: "var(--muted)" }}>Back to top ↑</a>
          </div>
        </div>
      </footer>
  );
}
