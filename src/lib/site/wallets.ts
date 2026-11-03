/** Donation wallets, grouped so one address can serve many networks. */
export type ChainFamily = "evm" | "bitcoin" | "solana" | "tron" | "stellar";

export interface Wallet {
  id: string;
  family: ChainFamily;
  label: string;
  networks: string[];
  address: string;
  note: string;
}

export const EVM_ADDRESS = "0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7";

export const WALLETS: Wallet[] = [
  {
    id: "evm",
    family: "evm",
    label: "Ethereum & EVM",
    networks: ["Ethereum", "Polygon", "Base", "Arbitrum", "OP", "Linea", "BNB Chain", "Monad", "Arc"],
    address: EVM_ADDRESS,
    note: "One address on every network below — pick the one you send from.",
  },
  {
    id: "btc",
    family: "bitcoin",
    label: "Bitcoin",
    networks: ["Bitcoin"],
    address: "bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm",
    note: "Native segwit address.",
  },
  {
    id: "sol",
    family: "solana",
    label: "Solana",
    networks: ["Solana"],
    address: "FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy",
    note: "SPL tokens welcome on the same address.",
  },
  {
    id: "trx",
    family: "tron",
    label: "Tron",
    networks: ["Tron"],
    address: "TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau",
    note: "TRC-20 USDT arrives here too.",
  },
  {
    id: "xlm",
    family: "stellar",
    label: "Stellar",
    networks: ["Stellar"],
    address: "GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ",
    note: "XLM and Stellar USDC.",
  },
];

export const chunks = (address: string, size = 4): string[] => address.match(new RegExp(`.{1,${size}}`, "g")) ?? [address];
