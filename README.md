# Mareader Marketing Site

Svelte 5 + TypeScript + Tailwind 4, pixel perfect rewrite of the React build.

## Stack
- Vite 7 + Svelte 5 runes
- Tailwind CSS 4 via @tailwindcss/vite
- Single file build via vite-plugin-singlefile

## Dev
```
npm ci
npm run dev
npm run build
```

## Structure
- `src/App.svelte` — layout + theme
- `src/lib/components/Film` — sticky film + camera
- `src/lib/components/Film/Mock` — mock window, panes, popovers
- `src/lib/stores/theme.svelte.ts` — dark mode
- `src/lib/actions/reveal.svelte.ts` — intersection reveal
- `src/app.css` + `src/lib/components/Film/Mock/mock.css`

## Validation
```
python3 scripts/validate.py
```
Checks commit subject <=50 and comment rules.

## Screenshots
```
npm run screenshots
```

## Eval
```
python3 scripts/eval.py
```

## CI
GitHub Actions runs validate, build, screenshots, eval on push to main.
