/* Intro — markup only. Behaviour is attached by the engine through data-k / data-* hooks. */
export default function Intro() {
  return (
      <div data-k="intro" className="intro" aria-hidden="true">
        <div className="intro-in">
          <div data-line="">
            <span>HODL garrison</span>
            <b>SECURE LINK</b>
          </div>
          <div data-line="">
            <span>Vault status</span>
            <em>ONLINE</em>
          </div>
          <div data-line="">
            <span>Sell orders</span>
            <b>DENIED</b>
          </div>
          <div data-line="">
            <span>Conviction</span>
            <em>MAX</em>
          </div>
          <div data-line="">
            <span>Guard</span>
            <em>ON DUTY</em>
          </div>
        </div>
      </div>
  );
}
