import Image from 'next/image';
import { STORE_URL, featured, lookbook, productUrl } from '@/data/products';

/* 04 · The Collection — featured drop + drag-to-browse lookbook (drag behaviour: engine `setupCrates`). */
export default function Collection() {
  return (
    <section id="collection" className="sec">
      <div className="wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', marginBottom: 'clamp(36px,6vh,60px)' }}>
          <div>
            <div data-reveal="" className="eyebrow">
              <span className="n">04</span>
              <span className="ln" />
              The Collection · HODLindustries
            </div>
            <h2 data-reveal="" className="h2">
              WEAR THE
              <br />
              CONVICTION.
            </h2>
          </div>
          <a data-reveal="" href={`${STORE_URL}/collections/all`} target="_blank" rel="noopener" className="btn btn-ghost">Shop the collection →</a>
        </div>

        <a data-reveal="" className="feat" href={productUrl(featured)} target="_blank" rel="noopener">
          <span className="feat-img prod-img">
            <Image src={featured.image} alt={featured.alt} fill sizes="(max-width: 900px) 100vw, 50vw" draggable={false} />
            <i className="br" />
            <em className="stamp-sec">{featured.label}</em>
          </span>
          <span className="feat-info">
            <span className="t">01 · {featured.tag}</span>
            <span className="nm">{featured.title}</span>
            <span className="sub" style={{ display: 'block' }}>{featured.blurb}</span>
            <span className="row">
              <b>{featured.price}</b>
              <span className="btn btn-or" style={{ padding: '12px 20px' }}>View product →</span>
            </span>
          </span>
        </a>

        <div data-reveal="" className="look-head">
          <span className="mono">The lookbook</span>
          <span className="mono" style={{ color: 'var(--muted)' }}>Drag to browse →</span>
        </div>
        <div data-reveal="" data-k="look" className="look">
          <div className="look-track">
            {lookbook.map((p, i) => (
              <a key={p.handle} className="prod" href={productUrl(p)} target="_blank" rel="noopener">
                <span className="prod-img">
                  <Image src={p.image} alt={p.alt} fill sizes="320px" draggable={false} />
                  <i className="br" />
                </span>
                <span className="prod-meta">
                  <span className="t">{String(i + 2).padStart(2, '0')} · {p.tag}</span>
                  <span className="nm">{p.title}</span>
                  <span className="row">
                    <b>{p.price}</b>
                    <span>View →</span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
        <p data-reveal="" className="fine" style={{ marginTop: '16px' }}>Products and prices from the official HODLindustries store. Checkout runs on Shopify.</p>
      </div>
    </section>
  );
}
