/* Reinvest — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
import { REINVEST_URL } from '@/data/links';

export default function Reinvest() {
  return (
      <section id="reinvest" className="sec" style={{ background: "linear-gradient(180deg,#0a0a0b,#0e0e10)" }}>
        <div className="wrap grid2" style={{ alignItems: "center" }}>
          <div data-reveal="">
            <div className="eyebrow">
              <span className="n">03</span>
              <span className="ln" />
              Auto-Reinvest
            </div>
            <h2 className="h2" style={{ fontSize: "clamp(2.4rem,6vw,5rem)" }}>
              KEEP IT
              <br />
              100% HODL.
            </h2>
            <p className="lede" style={{ marginTop: "22px", color: "var(--muted)" }}>
              Choose HODL instead of SOL for your payout. Auto-reinvest keeps your share of collected fees in HODL, helping compound your holding without selling that share.
            </p>
            <div className="hero-ctas" style={{ marginTop: "26px" }}>
              <a href={REINVEST_URL} target="_blank" rel="noopener" className="btn btn-or" data-burst="">Reinvest now ↗</a>
              <button type="button" className="btn btn-ghost" data-reinvest-demo="">See how it works ↓</button>
            </div>
            <ol className="olist">
              <li>
                <span>01</span>
                <span>
                  Open the project&apos;s payout settings — find the Auto-reinvest panel.
                </span>
              </li>
              <li>
                <span>02</span>
                <span>
                  Select &quot;Enable Auto-Reinvest&quot; to set payouts in HODL instead of SOL.
                </span>
              </li>
              <li>
                <span>03</span>
                <span>Set the reinvestment share to 100% and confirm the saved allocation.</span>
              </li>
            </ol>
          </div>
          <div data-reveal="" data-reveal-delay="140">
            <div data-k="reinvest" className="panel">
              <div className="panel-bar">
                <span>clashpad.fun / payouts</span>
                <span className="lv">Try it</span>
              </div>
              <div className="ri">
                <div className="mono" style={{ fontSize: "10px", letterSpacing: ".24em", color: "var(--muted)", marginBottom: "10px" }}>Payout currency</div>
                <div className="seg" role="group" aria-label="Payout currency">
                  <button type="button" data-cur="SOL" aria-pressed="true">SOL</button>
                  <button type="button" data-cur="HODL" aria-pressed="false">HODL</button>
                </div>
                <div className="ri-row">
                  <label htmlFor="hodl-ri">Reinvestment share</label>
                  <b data-k="ripct">0%</b>
                </div>
                <input id="hodl-ri" className="rng or" type="range" min="0" max="100" step="10" value="100" />
                <div data-k="coins" className="coins" aria-hidden="true" />
                <div className="ri-status">
                  <span data-k="rilabel">Payout in SOL</span>
                  <span data-k="ribadge" className="ri-badge">Diamond hands</span>
                </div>
              </div>
            </div>
            <p className="fine" style={{ marginTop: "14px" }}>
              Illustration only. This site explains the process. Wallet actions and reinvestment settings are managed on the project platform; no funds are handled here.
            </p>
          </div>
        </div>
      </section>
  );
}
