/* Hero — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Hero() {
  return (
      <section id="top" data-hero="" className="hero">
        <div className="stage">
          <div data-k="sky" className="layer">
            <div data-k="skyBase" />
            <div data-k="cloudL" className="clouds" />
            <div data-k="beamL" className="beams">
              <i data-k="beam0" />
              <i data-k="beam1" />
            </div>
            <div data-k="flashsky" className="flashsky" />
            <div data-k="boltL" />
            <canvas data-k="back" />
          </div>
          <div data-k="world" className="layer">
            <div data-k="wStatic" />
            <div data-k="signL" />
            <div data-k="wDyn" />
            <canvas data-k="front" />
          </div>
        </div>
        <div className="hero-shade" />
        <div className="alarm" aria-hidden="true" />
        <div data-k="reticle" className="reticle" />
        <div data-k="warn" className="warn" aria-hidden="true">
          <i />
          <b>HANDS OFF THE VAULT</b>
        </div>
        <div data-k="victory" className="vict" aria-hidden="true">
          <span>CONVICTION</span>
          <b>MAX</b>
        </div>
        <div className="hud" aria-hidden="true">
          <div>
            <span className="dot" />
            <span className="live">LIVE</span>
            {' '}· Sector 07 · HODL garrison
          </div>
          <div>
            Status{' '}
            <b data-k="status">ON WATCH · VAULT OPEN</b>
          </div>
          <div style={{ display: "none" }}>
            Next volley{' '}
            <b data-k="next">00:03</b>
          </div>
        </div>
        <div className="hero-copy">
          <div className="kicker">
            <i />
            Hold on for dear life
          </div>
          <h1 className="hero-h">
            <span><b>WE NEVER</b></span>
            <span><b className="o">SELL.</b></span>
          </h1>
          <p className="hero-p">
            Into the vault. Out of circulation. Once HODL goes in, it never comes out.
          </p>
          <div className="hero-ctas">
            <a href="#vault" className="btn btn-or" data-burst="">Enter the vault →</a>
            <a href="https://hodluntildeath.myshopify.com/" target="_blank" rel="noopener" className="btn btn-ghost">Explore the collection</a>
          </div>
        </div>
        <div data-k="hint" className="hint" aria-hidden="true">
          <i />
          Fire at the sky · don&apos;t touch the vault
        </div>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>
              <span>Built around conviction</span>
              <em>◆</em>
              <span>One way in · no way out</span>
              <em>◆</em>
              <span>We never sell</span>
              <em>◆</em>
              <span>HODL until death</span>
              <em>◆</em>
            </span>
            <span>
              <span>Built around conviction</span>
              <em>◆</em>
              <span>One way in · no way out</span>
              <em>◆</em>
              <span>We never sell</span>
              <em>◆</em>
              <span>HODL until death</span>
              <em>◆</em>
            </span>
          </div>
        </div>
      </section>
  );
}
