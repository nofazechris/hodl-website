/* Community — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
import { DISCORD_URL, INSTAGRAM_URL, TIKTOK_URL, X_URL } from '@/data/links';

export default function Community() {
  return (
      <section id="community" className="sec">
        <div className="wrap">
          <div className="oath-wrap">
            <div>
              <div data-reveal="" className="eyebrow">
                <span className="n">05</span>
                <span className="ln" />
                Community
              </div>
              <h2 data-reveal="" className="h2">
                MORE THAN
                <br />
                A POSITION.
              </h2>
              <p data-reveal="" data-reveal-delay="120" className="lede" style={{ marginTop: "22px", color: "var(--muted)", maxWidth: "44ch" }}>
                Every holder takes the same oath. Prove it: press and hold for three seconds. Let go early and the garrison will know.
              </p>
            </div>
            <div data-reveal="" data-reveal-delay="160">
              <button data-k="oath" className="oath" type="button" aria-label="Press and hold for three seconds to enlist">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(236,231,225,.1)" strokeWidth="6" />
                  <circle data-k="oathring" cx="100" cy="100" r="92" fill="none" stroke="#ff6a1f" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <span className="oath-core">
                  <span>
                    <i>3s</i>
                    <b data-k="oathlbl">HOLD TO ENLIST</b>
                  </span>
                </span>
              </button>
              <div data-k="oathmsg" className="oath-msg" aria-live="polite">Press and hold for 3 seconds.</div>
              <div data-k="oathdone" className="oath-done">
                <a className="btn btn-or" data-burst="" href="https://x.com/intent/tweet?text=I%20just%20enlisted.%20WE%20NEVER%20SELL.%20%40HODLUNTILDEATH" target="_blank" rel="noopener">Announce it on X ↗</a>
              </div>
            </div>
          </div>
          <div className="comms">
            <a data-reveal="" className="comm" href={X_URL} target="_blank" rel="noopener">
              <div className="top">
                <b>𝕏</b>
                <span>Follow →</span>
              </div>
              <div>
                <h3>@HODLUNTILDEATH</h3>
                <p>
                  Campaign drops, vault updates, and the loudest HODLers on the timeline.
                </p>
              </div>
            </a>
            <a data-reveal="" data-reveal-delay="120" className="comm" href={INSTAGRAM_URL} target="_blank" rel="noopener">
              <div className="top">
                <b>Instagram</b>
                <span>Follow →</span>
              </div>
              <div>
                <h3>@hodluntildeath</h3>
                <p>
                  The look of the movement — merch, campaign stills, and the culture of never selling.
                </p>
              </div>
            </a>
            <a data-reveal="" data-reveal-delay="180" className="comm" href={TIKTOK_URL} target="_blank" rel="noopener">
              <div className="top">
                <b>TikTok</b>
                <span>Follow →</span>
              </div>
              <div>
                <h3>@hodl582</h3>
                <p>
                  Short clips from the garrison — holders, drops, and the people who never sell.
                </p>
              </div>
            </a>
            <a data-reveal="" data-reveal-delay="240" className="comm" href={DISCORD_URL} target="_blank" rel="noopener">
              <div className="top">
                <b>Discord</b>
                <span>Join →</span>
              </div>
              <div>
                <h3>Join the garrison</h3>
                <p>
                  Talk conviction with other holders, get updates first, and hold the line together.
                </p>
              </div>
            </a>
            <a data-reveal="" data-reveal-delay="300" className="comm or" href="https://hodluntildeath.myshopify.com/" target="_blank" rel="noopener">
              <div className="top">
                <b>HODLindustries</b>
                <span style={{ color: "var(--or)" }}>Shop →</span>
              </div>
              <div>
                <h3>Wear it loud</h3>
                <p>
                  The merch is the membership card. Beanies, bandanas, patches — all on the official store.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>
  );
}
