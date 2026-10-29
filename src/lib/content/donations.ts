/**
 * Where money may go. One entry per address, not per network, because nine EVM
 * networks share one address and a donor should never have to work that out.
 * The rules and the reading of a card: docs/donations.md.
 */

/** One network an address works on. */
export interface Network {
  id: string;
  name: string;
  /** The token fees are paid in, spelled the way the wallet spells it. */
  gas: string;
  /** What only this network gets wrong, or '' when the fee line says enough. */
  note: string;
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
    gas: 'ETH',
    note: 'ERC-20 tokens, USDC and USDT live here first.',
    explorer: 'Etherscan',
    url: (address) => `https://etherscan.io/address/${address}`,
  },
  {
    id: 'base',
    name: 'Base',
    gas: 'ETH',
    note: 'Base has no token of its own.',
    explorer: 'BaseScan',
    url: (address) => `https://basescan.org/address/${address}`,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    gas: 'ETH',
    note: '',
    explorer: 'Arbiscan',
    url: (address) => `https://arbiscan.io/address/${address}`,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    gas: 'ETH',
    note: '',
    explorer: 'Optimism Etherscan',
    url: (address) => `https://optimistic.etherscan.io/address/${address}`,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    gas: 'POL',
    note: 'POL is what MATIC became.',
    explorer: 'PolygonScan',
    url: (address) => `https://polygonscan.com/address/${address}`,
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    gas: 'BNB',
    note: 'BEP-20 tokens, not ERC-20.',
    explorer: 'BscScan',
    url: (address) => `https://bscscan.com/address/${address}`,
  },
  {
    id: 'linea',
    name: 'Linea',
    gas: 'ETH',
    note: '',
    explorer: 'LineaScan',
    url: (address) => `https://lineascan.build/address/${address}`,
  },
  {
    id: 'monad',
    name: 'Monad',
    gas: 'MON',
    note: 'A newer chain; MON is the fee token.',
    explorer: 'Monadscan',
    url: (address) => `https://monadscan.com/address/${address}`,
  },
  {
    id: 'arc',
    name: 'Arc',
    gas: 'USDC',
    note: "Circle's network, where USDC also pays the fee.",
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
    note: 'Bitcoin only. Any wallet can send to this SegWit address.',
    address: 'bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm',
    networks: [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        gas: 'BTC',
        note: '',
        explorer: 'Mempool.space',
        url: (address) => `https://mempool.space/address/${address}`,
      },
    ],
  },
  {
    id: 'tron',
    name: 'Tron',
    note: 'TRC-20 USDT and USDC arrive here, and fees are paid in TRX.',
    address: 'TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau',
    networks: [
      {
        id: 'tron',
        name: 'Tron',
        gas: 'TRX',
        note: '',
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
        gas: 'SOL',
        note: '',
        explorer: 'Solscan',
        url: (address) => `https://solscan.io/account/${address}`,
      },
    ],
  },
  {
    id: 'stellar',
    name: 'Stellar',
    note: 'XLM and Stellar USDC. This account needs no memo.',
    address: 'GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ',
    networks: [
      {
        id: 'stellar',
        name: 'Stellar',
        gas: 'XLM',
        note: '',
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
