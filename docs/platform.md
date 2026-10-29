# Platform detection, and what the hero offers

> **Status:** v0.1 · **Last updated:** 2026-10-29

The hero's button names the visitor's system, because the first question a reader
has is "does this run here". Getting that wrong in either direction is worse than
not trying: offering a `.dmg` to a Windows machine reads as broken, and offering
a `.deb` to a phone reads as clueless.

## What is read

`src/lib/platform.ts`, in this order:

1. **`navigator.userAgentData`** (Chromium only): `platform` and `mobile`. This is
   the honest source where it exists.
2. **`navigator.platform`**: `MacIntel`, `Win32`, `Linux x86_64`, …
3. **The user agent string**, for the rest and for Android.

The result is one of four systems — `macos`, `windows`, `linux`, `unknown` — plus
whether the device is a phone or tablet.

## The rules

| Input                        | Result                    | Why                                                                                                                      |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Android` anywhere in the UA | `unknown`, `mobile: true` | Android is Linux underneath, and the app is not an Android app. The hero shows "See the downloads" and the list explains |
| `iPad` / `iPhone`            | `unknown`, `mobile: true` | There is no iOS build                                                                                                    |
| `Mac`                        | `macos`                   | macOS only                                                                                                               |
| `Win`                        | `windows`                 | Windows 10 and 11 both take the same `x64` installer                                                                     |
| `Linux`, `X11`, `CrOS`       | `linux`                   | ChromeOS reports Linux; the AppImage is the honest offer there                                                           |
| nothing recognisable         | `unknown`                 | The button says "See the downloads" and jumps to the full table                                                          |

## Architecture, honestly

Apple stopped naming its chip in the user agent in 2020, so a Mac arriving
without `userAgentData` cannot be told apart from the other kind.

- **Where UA-CH exists** (Chromium on an Apple machine), `getHighEntropyValues`
  answers `architecture: "arm"`, and the button points at the right `.dmg`
  with no switch shown.
- **Everywhere else**, Apple silicon is the default — every Mac Apple has sold
  since 2021 is ARM — and a two-segment switch (`Apple silicon` / `Intel`) sits
  beside the button. Choosing Intel rewrites the link immediately.
- The switch stays visible after it is used. `chooseArch()` deliberately does not
  set `archConfirmed`; that flag means _the browser said so_, and setting it from
  a click would remove the control the moment it was touched.
- No browser on macOS can confirm the architecture in Safari or Firefox today, so
  this is the common path, not the edge case. `docs/design.md` § Interaction
  details has the switch's shape.

## The download table

`src/lib/content/downloads.ts` is the single source: one row per published file
with the system, architecture, filename, a one-line note, and its install
command. `VERSION` and the GitHub asset URL are at the top; bumping a release
changes those two lines and nothing else.

| System  | Files offered, in order                                                          |
| ------- | -------------------------------------------------------------------------------- |
| macOS   | `Mareader_X_aarch64.dmg`, `Mareader_X_x64.dmg`                                   |
| Windows | `mareader_X_x64-setup.exe`, `mareader_X_x64_en-US.msi`                           |
| Linux   | `mareader_X_amd64.deb`, `mareader_X_x86_64.AppImage`, `mareader_X_x86_64.tar.gz` |

- The row matching the visitor's system is marked **your machine** in the list.
  `pick()` returns the exact architecture when both exist, and the first row when
  the architecture is unknown.
- Linux has no ARM build and Windows has no ARM build. The page does not pretend
  otherwise; `docs/psychology.md` § Trust and the limits section say so.
- A phone sees the same table, unmarked, plus one sentence explaining that the
  app is for a desktop.

## Testing it

`tests/site.spec.ts` covers the three paths that can break:

- **Linux** (`asSystem('Linux')`): the `.deb`, the "your machine" marker, and no
  Intel switch.
- **Windows**: the `.exe` installer.
- **macOS**: Apple silicon by default, then Intel after the switch is pressed.

Playwright's own Chrome profile reports Windows, so a test that cares must say
what it is testing. `asSystem()` overrides `navigator.userAgentData` before the
page script runs.

## Known limits

- A UA string can lie, and a privacy-hardened browser may present a generic one.
  Every wrong guess lands on a page with all the files on it, one click away.
- `CrOS` reports Linux and gets an AppImage, which does not run on ChromeOS
  without Crostini. Acceptable: Crostini users know.
- There is no telemetry on which button is pressed, so this file records the rules
  rather than a conversion rate. If that ever changes, it changes with consent.
