# Donations

> **Status:** v0.2 · **Last updated:** 2026-10-29

Two ways to give, one page, one press apart. Crypto is the international default
because it works everywhere today; the local Myanmar view exists because wallet
and bank transfers are how people there send money, and a QR of an Ethereum
address is a worse answer than a KBZPay number.

## The two views

`/donate` holds a tablist with `Crypto` and `Myanmar`. Both are the same page:
the intro, the "other ways to help" block and the footer do not change, so a
reader switching tabs never loses their place.

- **Crypto** (real, live): five addresses, each with a QR, a copy field and a
  link to a block explorer.
- **Myanmar** (a mock until the owner supplies accounts): three methods
  (KBZPay, Wave Pay, AYA Bank) drawn as _waiting cards_ — a dashed border, the
  shape of the number as `09 ··· ··· ···`, the state in words (`Coming soon`).

Nothing in the mock can receive money, and that is the point: an invented number
is worse than a missing one. `localMethods` in `src/lib/content/donations.ts`
carries `ready: false` until each method is real; flipping one to `true` and
filling `placeholder` with the account is the whole change.

## One card per address, not per network

The nine EVM networks below share a single address. Drawing nine cards would
repeat one string, one code and one copy button nine times, and a donor would
still have to work out which of the nine the card meant. So a card is drawn per
**address**, and the networks that address reaches are listed inside it.

```ts
interface Wallet {
  id: string;
  name: string; // 'EVM networks'
  note: string; // the one line under the name
  address: string;
  networks: Network[]; // one entry means there is no picker to draw
}
```

| Card         | Address                                                    | Networks                                                                  |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| EVM networks | `0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7`               | Ethereum, Base, Arbitrum, Optimism, Polygon, BNB Chain, Linea, Monad, Arc |
| Bitcoin      | `bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm`               | Bitcoin                                                                   |
| Tron         | `TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau`                       | Tron                                                                      |
| Solana       | `FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy`             | Solana                                                                    |
| Stellar      | `GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ` | Stellar                                                                   |

A single-network card keeps the same shape with a list of one: no picker, no
`9 networks` chip, just the address and its explorer. That is why the component
has one code path instead of two.

## The picker

Each network in the list carries its explorer and nothing else: no fee token, no
per-chain caveat. Nine explorer links under one address is nine ways to leave
the page by accident, so only the picked one is a link:

- **Chips, not a select.** Every network is visible, so a donor can see at once
  whether the chain they hold a balance on is covered. Nine chips fill one row at
  1440 px and make a 3 × 3 block on a phone; the rail is a grid with
  `auto-fit minmax(96px, 1fr)`, so ten or twelve networks wrap without a change.
- **The chip changes the explorer link. Never the address.** There is one
  address, one code and one copy button per card, and the picker cannot touch
  them. `tests/site.spec.ts` asserts that on BNB Chain, then Arc.
- **No labels telling people how chains work.** A card says the address, the
  code, the networks and where to check the transfer. "Fees are paid in BNB" and
  a closing paragraph about wrong-chain transfers were removed: a donor who
  knows what BNB is does not need them, and one who does not is not served by a
  sentence in a marketing page.
- The chosen chip is `aria-pressed="true"` inside a `role="group"` named
  `Network on EVM networks`; a screen reader hears the same fact the ink fill
  shows.
- Ethereum leads the list because it is where a donation most often starts. The
  order in the array is the order on the page; the rest is by likely balance.

## Adding a network

1. Add one entry to the family's `networks` array: `id`, `name`, the explorer's
   name and a `url` built from the address.
2. Run `npm run addresses` — the address is checked, not the new entry, but the
   gate proves nothing else moved.
3. Run `npm run qr:check` and `npm test`; the family's code is unchanged, which
   is the point.
4. Nothing else. The chip rail, the chip count and the phone layout are derived.

A new **address** is a new card: add the family to `wallets`, and add its address
to `tools/qr_check.mjs`, which keeps its own copy on purpose.

## The address of record

One file: `src/lib/content/donations.ts`. Rules:

- **Never reformat an address.** No spaces, no line breaks inside the string, no
  case changes. The QR encodes exactly what the copy button copies.
- **Never ship an unchecked address.** `npm run addresses` runs
  `tools/address_check.py`, which recomputes each network's own checksum:
  EIP-55 for the EVM address, bech32 for Bitcoin, Base58Check with SHA-256d for
  Tron, base58 as a 32-byte key for Solana, StrKey and its CRC16 for Stellar. A
  typo that changes one character fails it. The tool found a real one: the
  Bitcoin address shipped for a day with a missing `d`.
- The explorer links are built from the address so they cannot drift.
- The address is the whole message. Do not add per-chain fee notes or a
  paragraph about wrong-chain transfers; the picker's explorer link is the one
  thing that changes, and it is enough.

## Reading the card

Top to bottom: the family name with its network count, the one-line caveat, then
three zones.

1. **The code** at 168 px on the wide card and 148 px on the others, then up to
   208 px on a phone.
2. **The address** in a copy field, level with the code.
3. **The networks** — the chip rail, and the explorer link it changes.

- The code is drawn as SVG by `src/lib/qr.ts` with error correction **H** and a
  3-module quiet zone, in the page's ink and paper so it belongs to the card.
  Modules are near-square (0.94 of a cell, 0.22 radius) because a decoder reads
  area; the three finder patterns keep their exact 7-1-3 proportions.
- Do not shrink below ~140 px: at 47 modules that is 3 CSS pixels per module,
  which is the floor `tools/qr_check.mjs` verifies. Its decoder wants ~6 px per
  module, so it screenshots at 3× and scrolls each code into view first, since a
  card below the fold is still faded out by the reveal.
- The code is `role="img"` with a label naming the family and the address.
- `--qr-ink` / `--qr-paper` follow the theme. A themed code is still a
  high-contrast one: ink on raised paper, never accent on paper. Dark mode draws
  a light code on a dark plate, which iOS and Android both read.
- `npm run qr:check` is a gate: it decodes all five codes in both themes and
  compares the text to `donations.ts`. Run it after touching `qr.ts`,
  `QrCode.svelte`, `DonationCard.svelte` or the theme tokens.

## The Myanmar prompt

A reader whose browser hints at Myanmar — `Asia/Yangon` in the time zone, or a
`my` language tag — gets one line above the cards on their first visit to the
crypto view:

> Are you in Myanmar? Local transfers are easier than crypto there.
> **Show local methods →** · Not now

- It is a prompt, not a redirect: nobody is moved to a page they did not choose.
- It can be declined, and it disappears for the session. There is no cookie and
  no `localStorage` entry, so it returns on the next visit — deliberately, since
  a returning reader may now be giving, and it costs one line to ask again.
- The guess never leaves the browser. `src/lib/locale.ts` reads
  `navigator.languages` and `Intl.DateTimeFormat().resolvedOptions().timeZone`.
  No IP lookup, no geo API, no script from another origin.
- Anyone can switch either way at any time: the tabs are visible to everybody.

## When the mock becomes real

1. Collect the three accounts. Verify each by sending a small amount to it.
2. Fill `placeholder` with the real number, formatted the way the reader writes it.
3. Flip `ready: true` and change the card's state line to `Ready`.
4. Drop the "being collected" sentence from the intro in `routes/Donate.svelte`.
5. Add a Playwright test that the three numbers render and copy.
6. Keep the prompt: it is still the honest first question for that audience.
