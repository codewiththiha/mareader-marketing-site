/**
 * Where money may go. One entry per network; the address is repeated where a
 * network shares it, because a donor should never have to work that out.
 * Copy rules and the reason for two views: docs/donations.md.
 */

export interface Wallet {
  id: string;
  name: string;
  /** Shown under the name when the network has a trap worth naming. */
  note: string;
  address: string;
  /** Where the address is checked before it ships. */
  explorer: (address: string) => string;
}

export const wallets: Wallet[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    note: 'ETH, or any ERC-20 token. Not on another chain.',
    address: '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7',
    explorer: (address) => `https://etherscan.io/address/${address}`,
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    note: 'SegWit and legacy addresses both work.',
    address: 'bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm',
    explorer: (address) => `https://mempool.space/address/${address}`,
  },
  {
    id: 'solana',
    name: 'Solana',
    note: 'SOL, or SPL tokens sent to this account.',
    address: 'FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy',
    explorer: (address) => `https://solscan.io/account/${address}`,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    note: 'The same address as Ethereum, on the Polygon network.',
    address: '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7',
    explorer: (address) => `https://polygonscan.com/address/${address}`,
  },
];

export interface LocalMethod {
  id: string;
  name: string;
  /** Kept as a shape the real number will drop into; never invented digits. */
  placeholder: string;
  note: string;
  /** False until the owner supplies the account. Rendered as a waiting card. */
  ready: boolean;
}

/**
 * The Myanmar view: placeholders until the owner supplies accounts.
 */
export const localMethods: LocalMethod[] = [
  {
    id: 'kbzpay',
    name: 'KBZPay',
    placeholder: '09 ··· ··· ···',
    note: 'Wallet transfer, any KBZPay app.',
    ready: false,
  },
  {
    id: 'wave',
    name: 'Wave Pay',
    placeholder: '09 ··· ··· ···',
    note: 'Wallet transfer, Wave Money app.',
    ready: false,
  },
  {
    id: 'aya',
    name: 'AYA Bank',
    placeholder: '···· ···· ···· ····',
    note: 'Bank transfer, or a deposit at a branch.',
    ready: false,
  },
];
