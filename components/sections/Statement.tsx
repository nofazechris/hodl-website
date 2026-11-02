/* Statement — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Statement() {
  return (
      <section className="sec" style={{ borderTop: "0" }}>
        <div className="wrap">
          <div data-reveal="" className="mono" style={{ fontSize: "11px", letterSpacing: ".36em", color: "var(--muted)", marginBottom: "clamp(30px,5vh,56px)" }}>— The culture of never selling</div>
          <h2 data-reveal="" className="h2" style={{ fontWeight: "800", maxWidth: "16ch" }}>Conviction isn&apos;t a trade. It&apos;s a way of life.</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,5vw,80px)", marginTop: "clamp(40px,7vh,80px)", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div data-reveal="" data-reveal-delay="120" style={{ flex: "1 1 280px", maxWidth: "52ch" }}>
              <p className="lede" style={{ marginBottom: "20px" }}>
                Not a trading strategy. A holding conviction. HODL is built for people who decide once and never look back.
              </p>
              <p className="sub">
                The vault is the proof. Tokens that go in never come out — no exits, no sell pressure from the vaulted supply. Just holding, forever.
              </p>
            </div>
            <div data-reveal="" data-reveal-delay="220" className="inf" aria-hidden="true">∞</div>
          </div>
        </div>
      </section>
  );
}
