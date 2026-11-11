/** Public on-chain / clashpad identifiers used by the live vault stats. */
export const COIN_SLUG = 'hodl';
export const HODL_MINT = '6roVXGp6izrreewkZNbuAd5yZrzwLfX4Zmyh1U5nLeEp';
export const VAULT_WALLET = '7pt4tuPTGunJpcSCThazovbjkMHYXFhqGBUNZng2XUhg';

export const CLASHPAD_COIN_API = `https://clashpad.fun/api/coins/${COIN_SLUG}`;
export const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

/** Shape of GET /api/vault. */
export interface VaultStats {
  /** HODL held by the vault wallet (whole tokens). */
  lockedTokens: number;
  /** Share of the live token supply held by the vault wallet, in percent. */
  lockedPctSupply: number;
  /** Rough SOL value of the locked HODL at the current pool price. */
  lockedValueSol: number | null;
  /** SOL sitting in the vault wallet itself. */
  vaultSol: number;
  /** Lifetime fees collected by the project, in SOL. */
  feesCollectedSol: number;
  /** SOL already paid out to holders as rewards. */
  paidToHoldersSol: number;
  payments: number;
  holders: number | null;
  lastPayoutAt: string | null;
  /** When the upstream data was read. */
  updatedAt: string;
  /** True when upstream failed and the last good reading is served. */
  stale?: boolean;
}
