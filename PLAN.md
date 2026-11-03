# Build plan (scratch, deleted before commit)

## Decisions
- Keep Vite+Svelte5+Tailwind4 single-file build; add hash router (#/, #/releases, #/support).
- Deps: svelte 5.57, vite 8.3, plugin-svelte 7.3, tailwind 4.3, TS 6.0.3 (TS7 unsupported by tooling), playwright 1.64, marked, dompurify, qrcode-generator, prettier+eslint10 stack.
- Downloads: UA + userAgentData + WebGL arch detection; primary = detected platform; runtime refresh from GitHub releases API with baked fallback (scripts/pull_releases.py generates src/lib/releases/data.ts).
- Support: segmented Crypto|Myanmar pill; MM detected via Asia/Yangon tz or my lang; persisted choice; "Are you from Myanmar?" affordance; EVM group = one card, 9 chain chips (eth,polygon,base,arbitrum,op,bnb,linea,monad,arc) sharing 0xFaC1...95d7; BTC/SOL/TRON/XLM own cards; styled theme-aware SVG QRs (rounded modules, gold finders, chain mark center, scan shimmer).
- Myanmar panel mocked: KBZPay/Wave/AYA/CB/bank cards marked coming soon.
- Python strictness: scripts/commit_check.py + comment_check.py (ported), ci_watch.py poller, validate.py orchestrator; git hooks commit-msg + pre-commit.
- Animations: moving pill highlighter everywhere segmented; copy->check morph; qr scan shimmer; waddling tux; theme toggle morph; page transitions; reduced-motion respected.
- Psychology: one primary CTA above fold, size+version microcopy, unsigned-build first-launch honesty, no fake stats (0 stars), reciprocity copy on support.

## Steps
1. deps + configs (package.json, eslint, prettier, tsconfig)
2. python scripts + hooks + CI workflow
3. pull_releases.py -> data.ts
4. lib: router, platform, geo, wallets, markdown
5. components: Pill, marks (platforms, chains), QrCode, CopyButton, Nav, Footer, ThemeToggle, DownloadPanel, PageTransition
6. pages: Home (keep Film, smart hero CTA), Releases timeline, Support
7. css extensions in app.css
8. tests (UA override, MM tz, routes, copy, chips) + screenshots
9. preview server, critique loop w/ screenshots, polish
10. update README/AGENTS, commit in slices
