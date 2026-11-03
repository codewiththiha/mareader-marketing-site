/** Wallet grouping: one address may serve many networks, and QR payloads stay plain. */
import { describe, expect, it } from "vitest";
import { chunks, EVM_ADDRESS, WALLETS } from "../../src/lib/site/wallets";

describe("wallets", () => {
  it("groups every EVM network under one address", () => {
    const evm = WALLETS.find((w) => w.family === "evm");
    expect(evm?.address).toBe(EVM_ADDRESS);
    expect(evm?.networks).toContain("Polygon");
    expect(evm?.networks).toContain("Monad");
    expect(evm?.networks.length).toBe(9);
  });

  it("keeps one entry per other chain with unique addresses", () => {
    const others = WALLETS.filter((w) => w.family !== "evm");
    expect(others.map((w) => w.family)).toEqual(["bitcoin", "solana", "tron", "stellar"]);
    expect(new Set(others.map((w) => w.address)).size).toBe(others.length);
  });

  it("chunks addresses for readable wrapping", () => {
    expect(chunks("abcdef", 4)).toEqual(["abcd", "ef"]);
  });
});
