import { NextResponse } from 'next/server';
import {
  CLASHPAD_COIN_API,
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
  const [coinRes, accounts, balance, supply] = await Promise.all([
    fetch(CLASHPAD_COIN_API, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
    rpc<{ value: { account: { data: { parsed: { info: { tokenAmount: { uiAmount: number } } } } } }[] }>(
      'getTokenAccountsByOwner',
      [VAULT_WALLET, { mint: HODL_MINT }, { encoding: 'jsonParsed' }],
    ),
    rpc<{ value: number }>('getBalance', [VAULT_WALLET]),
    rpc<{ value: { uiAmount: number } }>('getTokenSupply', [HODL_MINT]),
  ]);
  if (!coinRes.ok) throw new Error(`clashpad ${coinRes.status}`);
  const coin = await coinRes.json();

  const lockedTokens = accounts.value.reduce(
    (sum, a) => sum + (a.account.data.parsed.info.tokenAmount.uiAmount || 0),
    0,
  );
  const totalSupply = supply.value.uiAmount || 0;
  // price_lamports is lamports per whole token
  const priceLamports = Number(coin.coin?.market?.price_lamports);
  const lockedValueSol = Number.isFinite(priceLamports) ? (lockedTokens * priceLamports) / 1e9 : null;

  return {
    lockedTokens,
    lockedPctSupply: totalSupply ? (lockedTokens / totalSupply) * 100 : 0,
    lockedValueSol,
    vaultSol: balance.value / 1e9,
    feesCollectedSol: lamportsToSol(coin.coin?.pot?.lifetime_lamports),
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
