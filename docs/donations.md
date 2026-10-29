# Donations

> **Status:** v0.1 · **Last updated:** 2026-10-29

Two ways to give, one page, one press apart. Crypto is the international default
because it works everywhere today; the local Myanmar view exists because wallet
and bank transfers are how people there send money, and a QR of an Ethereum
address is a worse answer than a KBZPay number.

## The two views

`/donate` holds a tablist with `Crypto` and `Myanmar`. Both are the same page:
the intro, the "other ways to help" block and the footer do not change, so a
reader switching tabs never loses their place.

- **Crypto** (real, live): four networks, each with a QR, the address in a copy
  field and a link to a block explorer.
- **Myanmar** (a mock until the owner supplies accounts): three methods
  (KBZPay, Wave Pay, AYA Bank) drawn as _waiting cards_ — a dashed border, the
  shape of the number as `09 ··· ··· ···`, the state in words (`Coming soon`).

Nothing in the mock can receive money, and that is the point: an invented number
is worse than a missing one. `localMethods` in `src/lib/content/donations.ts`
carries `ready: false` until each method is real; flipping one to `true` and
filling `placeholder` with the account is the whole change.

## The address of record

One file: `src/lib/content/donations.ts`.

| Network  | Address                                        | Note shown under the name                             |
| -------- | ---------------------------------------------- | ----------------------------------------------------- |
| Ethereum | `0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7`   | ETH, or any ERC-20 token. Not on another chain.       |
| Bitcoin  | `bc1qg454fmqylphrzfqh2kvlq54dt8t2kqaz452wm`    | SegWit and legacy addresses both work.                |
| Solana   | `FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy` | SOL, or SPL tokens sent to this account.              |
| Polygon  | `0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7`   | The same address as Ethereum, on the Polygon network. |

Rules:

- **Never reformat an address.** No spaces, no line breaks inside the string, no
  case changes. The QR encodes exactly what the copy button copies.
- The explorer links are per network (`etherscan.io`, `mempool.space`,
  `solscan.io`, `polygonscan.com`), built from the address so they cannot drift.
- Ethereum and Polygon share an address by design. The page says so twice — on
  the Polygon card and under the grid — because a transfer on the wrong chain is
  the one mistake that cannot be undone.
- A test asserts the copied clipboard text equals the Bitcoin address
  (`tests/site.spec.ts`); add one per network if a copy bug ever appears.

## The Myanmar prompt

A reader whose browser hints at Myanmar — `Asia/Yangon` in the time zone, or a
`my` language tag — gets one line above the wallet grid on their first visit to
the crypto view:

> Are you in Myanmar? Local transfers are easier than crypto there.
> **Show local methods →** · Not now

- It is a prompt, not a redirect: nobody is moved to a page they did not choose.
- It can be declined, and it disappears for the session. There is no cookie and
  no `localStorage` entry, so it returns on the next visit — deliberately, since
  a returning reader may now be giving, and it costs one line to ask again.
- The guess never leaves the browser. `src/lib/locale.ts` reads
  `navigator.languages` and `Intl.DateTimeFormat().resolvedOptions().timeZone`.
  No IP lookup, no geo API, no script from another origin.
- Anyone can switch either way at any time: the tabs are visible to everybody,
  and the Myanmar view is not hidden from the international audience.

## Reading the cards

Each wallet card, top to bottom: the network name and its one-line caveat, the
QR, the address with a copy button, and a quiet link to a block explorer. The QR
is centred and given the most room because it is what a phone points at; the
address below is the fallback for a desktop donor.

- The code is drawn as SVG by `src/lib/qr.ts` with error correction **H** and a
  3-module quiet zone, in the page's ink and paper so it belongs to the card.
  Rounded data dots; the three finder patterns keep their exact proportions,
  since scanners rely on them.
- Target size is 188 px on a desktop, 62–78 % of the card's width on a phone.
  Do not shrink below ~150 px: a phone camera at 200 mm needs it.
- The code is `role="img"` with a label naming the network and the address, so a
  screen reader announces what it is even though it cannot read it.
- `--qr-ink` / `--qr-paper` are set by the component and follow the theme. A
  themed code is still a high-contrast one: ink on raised paper, never accent on
  paper.

## When this becomes real

The Myanmar view ships as a mock. To finish it:

1. Collect the three accounts. Verify each by sending a small amount to it.
2. Fill `placeholder` with the real number, formatted the way the reader writes it.
3. Flip `ready: true` and change the card's state line to `Ready`.
4. Drop the "being collected" sentence from the intro in `routes/Donate.svelte`.
5. Add a Playwright test that the three numbers render and copy.
6. Keep the prompt: it is still the honest first question for that audience.
