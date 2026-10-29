/**
 * Where money may go. One entry per address, not per network, because nine EVM
 * networks share one address and a donor should never have to work that out.
 * The rules and the reading of a card: docs/donations.md.
 */

/** One network an address works on: a name, and where to check it. */
export interface Network {
  id: string;
  name: string;
  /** The explorer's own name, for the link text. */
  explorer: string;
  /** Built from the address so a link can never drift away from the card. */
  url: (address: string) => string;
}

export interface Wallet {
  id: string;
  name: string;
  /** The one line under the name. */
  note: string;
  address: string;
  /** Networks this reaches, most used first. One entry means no picker. */
  networks: Network[];
}

/**
 * Nine networks, one key. Ordered by how likely a donor holds a balance there.
 */
const evmNetworks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    explorer: 'Etherscan',
    url: (address) => `https://etherscan.io/address/${address}`,
  },
  {
    id: 'base',
    name: 'Base',
    explorer: 'BaseScan',
    url: (address) => `https://basescan.org/address/${address}`,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    explorer: 'Arbiscan',
    url: (address) => `https://arbiscan.io/address/${address}`,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    explorer: 'Optimism Etherscan',
    url: (address) => `https://optimistic.etherscan.io/address/${address}`,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    explorer: 'PolygonScan',
    url: (address) => `https://polygonscan.com/address/${address}`,
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    explorer: 'BscScan',
    url: (address) => `https://bscscan.com/address/${address}`,
  },
  {
    id: 'linea',
    name: 'Linea',
    explorer: 'LineaScan',
    url: (address) => `https://lineascan.build/address/${address}`,
  },
  {
    id: 'monad',
    name: 'Monad',
    explorer: 'Monadscan',
    url: (address) => `https://monadscan.com/address/${address}`,
  },
  {
    id: 'arc',
    name: 'Arc',
    explorer: 'Arc Explorer',
    url: (address) => `https://explorer.arc.io/address/${address}`,
  },
];

/**
 * The card order: the nine-network family first, then the single chains.
 */
export const wallets: Wallet[] = [
  {
    id: 'evm',
    name: 'EVM networks',
    note: 'One address, nine networks. Pick yours to see where it settles.',
    address: '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7',
    networks: evmNetworks,
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    note: 'Bitcoin only. Any wallet can send to it.',
    address: 'bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm',
    networks: [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        explorer: 'Mempool.space',
        url: (address) => `https://mempool.space/address/${address}`,
      },
    ],
  },
  {
    id: 'tron',
    name: 'Tron',
    note: 'For TRC-20 tokens, such as the USDT most exchanges send.',
    address: 'TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau',
    networks: [
      {
        id: 'tron',
        name: 'Tron',
        explorer: 'Tronscan',
        url: (address) => `https://tronscan.org/#/address/${address}`,
      },
    ],
  },
  {
    id: 'solana',
    name: 'Solana',
    note: 'SOL, or any SPL token sent to this account.',
    address: 'FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy',
    networks: [
      {
        id: 'solana',
        name: 'Solana',
        explorer: 'Solscan',
        url: (address) => `https://solscan.io/account/${address}`,
      },
    ],
  },
  {
    id: 'stellar',
    name: 'Stellar',
    note: 'XLM and Stellar USDC. No memo needed.',
    address: 'GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ',
    networks: [
      {
        id: 'stellar',
        name: 'Stellar',
        explorer: 'Stellar Expert',
        url: (address) => `https://stellar.expert/explorer/public/account/${address}`,
      },
    ],
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
