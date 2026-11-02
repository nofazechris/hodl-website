/* Vault — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Vault() {
  return (
      <section id="vault" className="sec" style={{ paddingBottom: "0", background: "linear-gradient(180deg,#0a0a0b,#0e0e10)" }}>
        <div className="wrap vhead">
          <div data-reveal="" className="eyebrow">
            <span className="n">01</span>
            <span className="ln" />
            The Vault
          </div>
          <div className="grid2">
            <h2 data-reveal="" className="h2">
              ONE WAY IN.
              <br />
              NO WAY OUT.
            </h2>
            <div data-reveal="" data-reveal-delay="140">
              <p className="lede" style={{ marginBottom: "18px" }}>
                The HODL vault is built around one principle: tokens that enter the vault are never withdrawn or sold. Buybacks add HODL to the vault, keeping those tokens out of circulation.
              </p>
              <p className="sub">
                Holding is the point. No exits. No sell pressure from the vaulted tokens.
              </p>
            </div>
          </div>
        </div>
        <div data-k="vtrack" className="vtrack">
          <div className="wrap vsticky">
            <div>
              <div className="mono" style={{ fontSize: "10.5px", letterSpacing: ".3em", color: "var(--muted)" }}>Follow the flow · scroll</div>
              <ol className="vsteps">
                <li data-vstep="" className="vstep">
                  <span className="n">STEP 01</span>
                  <div>
                    <h3>Buy back</h3>
                    <p>Project fees fund daily buybacks of HODL.</p>
                  </div>
                </li>
                <li data-vstep="" className="vstep">
                  <span className="n">STEP 02</span>
                  <div>
                    <h3>Vault</h3>
                    <p>Every bought-back token goes straight into the vault.</p>
                  </div>
                </li>
                <li data-vstep="" className="vstep">
                  <span className="n">STEP 03</span>
                  <div>
                    <h3>Hold. Forever.</h3>
                    <p>Once in the vault, tokens are never withdrawn.</p>
                  </div>
                </li>
              </ol>
            </div>
            <div data-k="vstage" className="vstage" aria-hidden="true">
              <div className="vread">
                <span>
                  Door{' '}
                  <b data-k="vdoorstate">OPEN · INTAKE</b>
                </span>
                <span>
                  Exits{' '}
                  <b>NONE</b>
                </span>
                <span>
                  Illustration{' '}
                  <b data-k="vcount">0 / 16</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
