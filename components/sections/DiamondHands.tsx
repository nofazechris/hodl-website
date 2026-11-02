/* DiamondHands — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function DiamondHands() {
  return (
      <section data-k="never" className="never dh" aria-label="We never sell — diamond hands">
        <div data-k="dhtrack" className="dh-track">
          <div className="dh-sticky">
            <div className="dh-bg" aria-hidden="true">
              <div data-ntrack="" className="never-row">
                <span className="st">LESS SELL PRESSURE</span>
                <span className="st">MORE CONVICTION</span>
                <span className="st">LESS SELL PRESSURE</span>
              </div>
              <div data-ntrack="" className="never-row" style={{ marginLeft: "-30%" }}>
                <span className="st">DIAMOND HANDS</span>
                <span className="st">DIAMOND HANDS</span>
                <span className="st">DIAMOND HANDS</span>
              </div>
              <div data-ntrack="" className="never-row">
                <span className="st">HODL UNTIL DEATH</span>
                <span className="st">HODL UNTIL DEATH</span>
              </div>
            </div>
            <div data-k="dhstage" className="dh-stage" aria-hidden="true" />
            <div className="dh-top">
              <span className="mono">— The only rule</span>
              <span className="mono dh-step">Scroll · the token drops · the hands close</span>
            </div>
            <h2 className="dh-h">
              <span className="w1"><b>NEVER</b></span>
              <span className="w2"><b>SELL.</b></span>
            </h2>
            <div className="dh-foot">
              <div className="dh-dh">
                <span className="mono">Diamond hands</span>
                <b>
                  GRIP{' '}
                  <i data-k="dhgrip">0%</i>
                </b>
              </div>
              <div className="dh-meta">
                <span data-k="dhhint" className="mono dh-hint">Scroll to drop it in</span>
                <span className="mono dh-score">
                  Steals{' '}
                  <b data-k="dhsteals" className="win">0</b>
                  {' '}· Blocked{' '}
                  <b data-k="dhcount">0</b>
                </span>
              </div>
            </div>
            <div data-k="dhmsg" className="dh-msg" aria-live="polite">NICE TRY.</div>
          </div>
        </div>
      </section>
  );
}
