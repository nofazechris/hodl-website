/* Finale — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Finale() {
  return (
      <section className="fin">
        <div className="wrap fin-grid">
          <div style={{ paddingBottom: "clamp(60px,10vh,120px)" }}>
            <div data-reveal="" className="eyebrow">
              <span className="n">07</span>
              <span className="ln" />
              The only move
            </div>
            <h2 data-reveal="">
              HOLD YOUR
              <br />
              <em>GROUND.</em>
            </h2>
            <div data-reveal="" data-reveal-delay="140" style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <a href="https://clashpad.fun/coin.html?c=hodl" target="_blank" rel="noopener" className="btn btn-or" data-burst="">Buy HODL →</a>
              <a href="https://hodluntildeath.myshopify.com/" target="_blank" rel="noopener" className="btn btn-ghost">Shop the collection</a>
              <a href="https://x.com/HODLUNTILDEATH" target="_blank" rel="noopener" className="btn btn-ghost">Follow on X</a>
            </div>
          </div>
          <div data-k="finale" className="fin-art" aria-hidden="true" />
        </div>
      </section>
  );
}
