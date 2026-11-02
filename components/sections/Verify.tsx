/* Verify — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Verify() {
  return (
      <section id="verify" className="sec" style={{ background: "linear-gradient(180deg,#0a0a0b,#0e0e10)" }}>
        <div className="wrap grid2">
          <div>
            <div data-reveal="" className="eyebrow">
              <span className="n">06</span>
              <span className="ln" />
              Transparency
            </div>
            <h2 data-reveal="" className="h2">
              DON&apos;T TRUST.
              <br />
              VERIFY.
            </h2>
            <p data-reveal="" data-reveal-delay="120" className="lede" style={{ marginTop: "22px", color: "var(--muted)", maxWidth: "44ch" }}>
              Know the destination. Check the details. Official project identifiers are listed here — always verify project and wallet details before interacting with cryptocurrency addresses.
            </p>
          </div>
          <div data-reveal="" data-reveal-delay="140" data-declass="" className="dossier">
            <div className="drow" data-row="">
              <div>
                <div className="k">Project link</div>
                <div className="v">https://clashpad.fun/coin.html?c=hodl</div>
              </div>
              <a className="copy" href="https://clashpad.fun/coin.html?c=hodl" target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center" }}>OPEN ↗</a>
            </div>
            <div className="drow" data-row="">
              <div>
                <div className="k">Project / transaction hash</div>
                <div className="v">6roVXGp6izrreewkZNbuAd5yZrzwLfX4Zmyh1U5nLeEp</div>
              </div>
              <button className="copy" type="button" data-copy="6roVXGp6izrreewkZNbuAd5yZrzwLfX4Zmyh1U5nLeEp"><span>COPY</span></button>
              <i className="stamp">COPIED</i>
            </div>
            <div className="drow" data-row="">
              <div>
                <div className="k">
                  HODL vault wallet{' '}
                  <a href="https://solscan.io/account/7pt4tuPTGunJpcSCThazovbjkMHYXFhqGBUNZng2XUhg" target="_blank" rel="noopener">Solscan ↗</a>
                </div>
                <div className="v">7pt4tuPTGunJpcSCThazovbjkMHYXFhqGBUNZng2XUhg</div>
              </div>
              <button className="copy" type="button" data-copy="7pt4tuPTGunJpcSCThazovbjkMHYXFhqGBUNZng2XUhg"><span>COPY</span></button>
              <i className="stamp">COPIED</i>
            </div>
            <div className="drow" data-row="">
              <div>
                <div className="k">X profile</div>
                <div className="v">https://x.com/HODLUNTILDEATH</div>
              </div>
              <a className="copy" href="https://x.com/HODLUNTILDEATH" target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center" }}>OPEN ↗</a>
            </div>
          </div>
        </div>
      </section>
  );
}
