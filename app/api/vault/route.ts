import { NextResponse } from 'next/server';
import {
  CLASHPAD_COIN_API,
  CLASHPAD_REWARDS_API,
  HODL_MINT,
  SOLANA_RPC,
  VAULT_WALLET,
  type VaultStats,
} from '@/data/vault';

export const dynamic = 'force-dynamic';

const TTL_MS = 60_000;
let cache: { at: number; data: VaultStats } | null = null;

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`rpc ${method} ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`rpc ${method}: ${json.error.message}`);
  return json.result as T;
}

const lamportsToSol = (v: unknown): number => Number(v ?? 0) / 1e9;

async function read(): Promise<VaultStats> {
  const [coinRes, accounts, balance, supply, rewards] = await Promise.all([
    fetch(CLASHPAD_COIN_API, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
    rpc<{ value: { account: { data: { parsed: { info: { tokenAmount: { uiAmount: number } } } } } }[] }>(
      'getTokenAccountsByOwner',
      [VAULT_WALLET, { mint: HODL_MINT }, { encoding: 'jsonParsed' }],
    ),
    rpc<{ value: number }>('getBalance', [VAULT_WALLET]),
    rpc<{ value: { uiAmount: number } }>('getTokenSupply', [HODL_MINT]),
    // a failed rewards lookup leaves the earned figure blank instead of guessing
    fetch(CLASHPAD_REWARDS_API(VAULT_WALLET), { cache: 'no-store', signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);
  if (!coinRes.ok) throw new Error(`clashpad ${coinRes.status}`);
  const coin = await coinRes.json();

  const heldTokens = accounts.value.reduce(
    (sum, a) => sum + (a.account.data.parsed.info.tokenAmount.uiAmount || 0),
    0,
  );
  const totalSupply = supply.value.uiAmount || 0;
  // price_lamports is lamports per whole token
  const priceLamports = Number(coin.coin?.market?.price_lamports);
  const heldValueSol = Number.isFinite(priceLamports) ? (heldTokens * priceLamports) / 1e9 : null;

  return {
    heldTokens,
    heldPctSupply: totalSupply ? (heldTokens / totalSupply) * 100 : 0,
    heldValueSol,
    vaultSol: balance.value / 1e9,
    vaultEarnedSol: rewards && rewards.paidLamports != null ? lamportsToSol(rewards.paidLamports) : null,
    vaultPendingSol: rewards && rewards.savedLamports != null ? lamportsToSol(rewards.savedLamports) : null,
    paidToHoldersSol: lamportsToSol(coin.coin?.rewardsPaid?.paidLamports),
    payments: Number(coin.coin?.rewardsPaid?.payments ?? 0),
    holders: coin.coin?.market?.holder_count ?? null,
    lastPayoutAt: coin.coin?.rewardsPaid?.lastPaidAt ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, { headers: { 'cache-control': 'public, s-maxage=30, stale-while-revalidate=120' } });
  }
  try {
    const data = await read();
    cache = { at: now, data };
    return NextResponse.json(data, { headers: { 'cache-control': 'public, s-maxage=30, stale-while-revalidate=120' } });
  } catch {
    if (cache) return NextResponse.json({ ...cache.data, stale: true });
    return NextResponse.json({ error: 'vault data unavailable' }, { status: 503 });
  }
}
