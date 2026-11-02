/* Overlays — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Overlays() {
  return (
    <>
      <div data-k="progress" className="progress" />
      <div className="grain" aria-hidden="true" />
      <canvas data-k="gfx" className="gfx" aria-hidden="true" />
      <div data-k="deny" className="deny" aria-live="assertive">
        <div className="deny-in">
          <div className="deny-stamp">DENIED</div>
          <div className="deny-sub">We never sell.</div>
        </div>
      </div>
      <div data-k="promo" className="promo" aria-live="polite">
        <i>▲</i>
        <span>
          Promoted ·{' '}
          <b data-k="promoname">PRIVATE</b>
        </span>
      </div>
      <div data-k="rank" className="rank" aria-hidden="true">
        <span>
          On duty{' '}
          <b data-k="ranktime">00:00</b>
        </span>
        <span className="rn" data-k="rankname">RECRUIT</span>
        <span className="rank-bar"><i data-k="rankbar" /></span>
      </div>
    </>
  );
}
