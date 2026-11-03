// wallets — donation addresses; the EVM family shares one
export interface Chain {
  id: string;
  name: string;
  mark: string;
  explorer?: (address: string) => string;
}

export interface Wallet {
  id: string;
  name: string;
  coin: string;
  address: string;
  mark: string;
  chains?: Chain[];
  explorer?: (address: string) => string;
  note?: string;
}

const addr = (host: string) => (a: string) => `${host}/address/${a}`;

export const EVM_CHAINS: Chain[] = [
  { id: "ethereum", name: "Ethereum", mark: "ethereum", explorer: addr("https://etherscan.io") },
  { id: "base", name: "Base", mark: "base", explorer: addr("https://basescan.org") },
  { id: "arbitrum", name: "Arbitrum", mark: "arbitrum", explorer: addr("https://arbiscan.io") },
  {
    id: "optimism",
    name: "OP Mainnet",
    mark: "optimism",
    explorer: addr("https://optimism.etherscan.io")
  },
  { id: "polygon", name: "Polygon", mark: "polygon", explorer: addr("https://polygonscan.com") },
  { id: "bnb", name: "BNB Chain", mark: "bnbchain", explorer: addr("https://bscscan.com") },
  { id: "linea", name: "Linea", mark: "linea", explorer: addr("https://lineascan.build") },
  { id: "monad", name: "Monad", mark: "monad", explorer: addr("https://monadscan.com") },
  { id: "arc", name: "Arc", mark: "arc" }
];

export const EVM_ADDRESS = "0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7";

export const WALLETS: Wallet[] = [
  {
    id: "evm",
    name: "Ethereum & EVM chains",
    coin: "ETH and any EVM token",
    address: EVM_ADDRESS,
    mark: "ethereum",
    chains: EVM_CHAINS,
    note: "One address receives on every chain above."
  },
  {
    id: "btc",
    name: "Bitcoin",
    coin: "BTC",
    address: "bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm",
    mark: "bitcoin",
    explorer: (a) => `https://mempool.space/address/${a}`,
    note: "Native SegWit (bech32) address."
  },
  {
    id: "sol",
    name: "Solana",
    coin: "SOL",
    address: "FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy",
    mark: "solana",
    explorer: (a) => `https://solscan.io/account/${a}`
  },
  {
    id: "trx",
    name: "Tron",
    coin: "TRX",
    address: "TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau",
    mark: "tron",
    explorer: (a) => `https://tronscan.org/#/address/${a}`
  },
  {
    id: "xlm",
    name: "Stellar",
    coin: "XLM",
    address: "GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ",
    mark: "stellar",
    explorer: (a) => `https://stellar.expert/public/address/${a}`,
    note: "No memo needed."
  }
];

export function shortAddress(a: string): string {
  return a.length <= 20 ? a : `${a.slice(0, 10)}…${a.slice(-8)}`;
}
