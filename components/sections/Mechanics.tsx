/* Mechanics — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Mechanics() {
  return (
      <section id="mechanics" className="sec">
        <div className="wrap">
          <div data-reveal="" className="eyebrow">
            <span className="n">02</span>
            <span className="ln" />
            Buybacks &amp; Fees
          </div>
          <h2 data-reveal="" className="h2" style={{ marginBottom: "18px" }}>
            FEES INTO
            <br />
            CONVICTION.
          </h2>
          <p data-reveal="" data-reveal-delay="120" className="sub" style={{ maxWidth: "56ch", fontSize: "clamp(15px,1.5vw,18px)", marginBottom: "clamp(40px,6vh,72px)" }}>
            A clear view of how project fees, HODL buybacks, and the vault fit together.
          </p>
          <div className="grid2">
            <ol data-reveal="" className="msteps">
              <li>
                <span className="n">01</span>
                <div>
                  <h3>HODL held by projects</h3>
                  <p>
                    For each other Clashpad project, the percentage of HODL it holds sets the same percentage of HODL&apos;s fees allocated to buy that project&apos;s token each day.
                  </p>
                  <span className="tag">Allocation basis · Project&apos;s HODL share</span>
                </div>
              </li>
              <li>
                <span className="n">02</span>
                <div>
                  <h3>Buy each project&apos;s token</h3>
                  <p>
                    For example, if another Clashpad project holds 1% of HODL, 1% of HODL&apos;s fees are used every day to buy that project&apos;s token.
                  </p>
                  <span className="tag">Purchase frequency · Daily</span>
                </div>
              </li>
              <li>
                <span className="n">03</span>
                <div>
                  <h3>Tokens go into the vault</h3>
                  <p>
                    Every token purchased through this fee allocation goes into the HODL vault. Once tokens are in the vault, they are never withdrawn.
                  </p>
                  <span className="tag">Destination · HODL vault · permanent</span>
                </div>
              </li>
            </ol>
            <div data-reveal="" data-reveal-delay="140" data-k="fees" className="panel">
              <div className="panel-bar">
                <span>Allocation simulator</span>
                <span className="lv">Interactive</span>
              </div>
              <div data-k="feecv" className="feecv"><canvas aria-hidden="true" /></div>
              <div className="feectl">
                <div className="feebig">
                  <div className="v" data-k="feepct">1.0%</div>
                  <div className="l">
                    If a project holds{' '}
                    <b data-k="feepct">1.0%</b>
                    {' '}of HODL, that share of HODL&apos;s fees buys its token every day — straight into the vault.
                  </div>
                </div>
                <label className="mono" style={{ display: "block", fontSize: "10px", letterSpacing: ".24em", color: "var(--muted)", marginBottom: "4px" }}>Drag · project&apos;s share of HODL held</label>
                <div data-k="feeslider" className="sld" role="slider" tabIndex={0} aria-label="Project's share of HODL held" aria-valuemin={0.1} aria-valuemax={10} aria-valuenow={1} aria-valuetext="1.0%">
                  <span className="sld-fill" />
                  <span className="sld-thumb" />
                </div>
                <div className="rng-scale">
                  <span>0.1%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>
          <p data-reveal="" className="fine" style={{ marginTop: "28px", maxWidth: "80ch" }}>
            The allocation for each project follows its percentage of HODL held. The simulator is an illustration, not live data. Exact fee totals, eligible projects, purchase execution, and on-chain enforcement details should be confirmed in the published project documentation.
          </p>
        </div>
      </section>
  );
}
