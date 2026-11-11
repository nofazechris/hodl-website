'use client';

import { useEffect, useRef, useState } from 'react';
import { VAULT_WALLET, type VaultStats as Stats } from '@/data/vault';

const REFRESH_MS = 60_000;

/** Counts up to `value` (from whatever is on screen) and writes straight to the DOM. */
function CountUp({ value, decimals = 0 }: { value: number | null; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return;
    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = shown.current, to = value;
    if (reduced || from === to) { shown.current = to; el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1500;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      shown.current = from + (to - from) * e;
      el.textContent = fmt(shown.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, decimals]);

  return <span ref={ref}>{value === null ? '—' : '0'}</span>;
}

function ago(iso: string | null, now: number): string {
  if (!iso) return '—';
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const pct = (n: number) => (n >= 1 ? n.toFixed(2) : n >= 0.01 ? n.toFixed(3) : n.toFixed(4));

export default function VaultStats() {
  const [data, setData] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let dead = false;
    const load = async () => {
      try {
        const res = await fetch('/api/vault', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const json: Stats = await res.json();
        if (!dead) { setData(json); setFailed(false); setNow(Date.now()); }
      } catch {
        if (!dead) setFailed(true);
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => { dead = true; clearInterval(id); clearInterval(tick); };
  }, []);

  const live = !!data && !data.stale && !failed;
  const short = `${VAULT_WALLET.slice(0, 6)}…${VAULT_WALLET.slice(-6)}`;

  return (
    <section id="vault-live" className="sec vlive">
      <div className="wrap">
        <div data-reveal="" className="eyebrow">
          <span className="n">LIVE</span>
          <span className="ln" />
          Vault ledger
        </div>
        <div className="vl-head">
          <h2 data-reveal="" className="h2">
            HELD.
            <br />
            <em>EARNING.</em>
          </h2>
          <div data-reveal="" data-reveal-delay="140" className="vl-meta">
            <p className="lede" style={{ color: "var(--muted)", maxWidth: "40ch" }}>
              Straight from the chain and the project page. What the vault holds, and the SOL it has earned.
            </p>
            <div className={`vl-live${live ? ' is-live' : ''}`} aria-live="polite">
              <i />
              {data ? (live ? 'Live' : 'Last reading') : failed ? 'Data unavailable' : 'Syncing…'}
              {data && <span> · updated {ago(data.updatedAt, now)}</span>}
            </div>
          </div>
        </div>

        <div data-reveal="" data-reveal-delay="100" className="vl-grid">
          <div className="vl-card vl-big">
            <svg className="vl-dial" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" opacity=".5" />
              <circle cx="100" cy="100" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35" />
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line key={i} x1="100" y1="6" x2="100" y2="16" transform={`rotate(${i * 30} 100 100)`} />
                ))}
              </g>
            </svg>
            <div className="vl-k">Held in the vault</div>
            <div className="vl-num">
              <CountUp value={data ? data.heldTokens : null} decimals={0} />
              <small>HODL</small>
            </div>
            <div className="vl-sub">
              {data ? (
                <>
                  <b>{pct(data.heldPctSupply)}%</b> of supply
                  {data.heldValueSol !== null && (
                    <>
                      {' '}· ≈ <b>{data.heldValueSol.toFixed(data.heldValueSol < 1 ? 4 : 2)} SOL</b>
                    </>
                  )}
                </>
              ) : (
                'Reading the vault wallet…'
              )}
            </div>
            <div className="vl-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, Math.max(data ? data.heldPctSupply : 0, 0.6))}%` }} /></div>
          </div>

          <div className="vl-card">
            <div className="vl-k">SOL earned</div>
            <div className="vl-num vl-or">
              <CountUp value={data ? data.feesCollectedSol : null} decimals={2} />
              <small>SOL</small>
            </div>
            <div className="vl-sub">Lifetime fees collected</div>
          </div>

          <div className="vl-card">
            <div className="vl-k">Paid to holders</div>
            <div className="vl-num">
              <CountUp value={data ? data.paidToHoldersSol : null} decimals={2} />
              <small>SOL</small>
            </div>
            <div className="vl-sub">
              {data ? <><b>{data.payments.toLocaleString('en-US')}</b> payouts · last {ago(data.lastPayoutAt, now)}</> : 'Counting payouts…'}
            </div>
          </div>

          <div className="vl-card">
            <div className="vl-k">Holders</div>
            <div className="vl-num">
              <CountUp value={data ? data.holders : null} decimals={0} />
            </div>
            <div className="vl-sub">Wallets holding HODL</div>
          </div>

          <a className="vl-card vl-link" href={`https://solscan.io/account/${VAULT_WALLET}`} target="_blank" rel="noopener">
            <div className="vl-k">Vault wallet</div>
            <div className="vl-addr">{short}</div>
            <div className="vl-sub">Verify on Solscan ↗</div>
          </a>
        </div>

        <p className="fine" style={{ marginTop: "18px" }}>
          Held amount is the live HODL balance of the vault wallet. SOL figures come from the HODL page on clashpad.fun. Refreshes every minute. Informational only, not financial advice.
        </p>
      </div>
    </section>
  );
}
