/** Public on-chain / clashpad identifiers used by the live vault stats. */
export const COIN_SLUG = 'hodl';
export const HODL_MINT = '6roVXGp6izrreewkZNbuAd5yZrzwLfX4Zmyh1U5nLeEp';
export const VAULT_WALLET = '2DUQDBVGvPjyp9mH7aVqKxqKZ1qjVt83q9b62MMzCvEw';

export const CLASHPAD_COIN_API = `https://clashpad.fun/api/coins/${COIN_SLUG}`;
export const CLASHPAD_REWARDS_API = (wallet: string) => `https://clashpad.fun/api/rewards/${COIN_SLUG}/${wallet}`;
export const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

/** Shape of GET /api/vault. */
export interface VaultStats {
  /** HODL held by the vault wallet (whole tokens). */
  heldTokens: number;
  /** Share of the live token supply held by the vault wallet, in percent. */
  heldPctSupply: number;
  /** Rough SOL value of the held HODL at the current pool price. */
  heldValueSol: number | null;
  /** SOL sitting in the vault wallet itself. */
  vaultSol: number;
  /** SOL of holder rewards paid to the vault wallet itself (null if unavailable). */
  vaultEarnedSol: number | null;
  /** SOL of rewards saved for the vault wallet, not yet paid. */
  vaultPendingSol: number | null;
  /** SOL paid out to all holders as rewards (project-wide). */
  paidToHoldersSol: number;
  payments: number;
  holders: number | null;
  lastPayoutAt: string | null;
  /** When the upstream data was read. */
  updatedAt: string;
  /** True when upstream failed and the last good reading is served. */
  stale?: boolean;
}
