# Portfolio Analyzer

A browser-based portfolio exposure analyzer for IBKR (Interactive Brokers) margin accounts. Drop in a Flex Query CSV export and get instant breakdowns by asset type, sector, region, style, cyclicality, currency, and position size.

## Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Data input

Export a **Flex Query** from IBKR with at minimum these fields:

- `Symbol`
- `Description`
- `PercentOfNAV`
- `SubCategory`
- `CurrencyPrimary`

Save the file as `public/portfolio.csv`. The app fetches it on load. Rows with `SubCategory = RIGHT` and blank `PercentOfNAV` are automatically excluded.

## Adding / updating positions

Position metadata (sector, region, style, cyclicality, type) lives in `src/portfolioConfig.js`. Each key is the exact ticker string from the IBKR `Symbol` column:

```js
"MSFT": { type: "Részvény", sector: "Tech / AI", region: "USA", style: "Growth", cyclicality: "Növekedési / Quality" },
```

If a ticker is missing from the config, the app falls back to IBKR's `SubCategory` for `type` and labels everything else as `Egyéb` (Other).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint check |

## Claude Code commands

| Command | Description |
|---|---|
| `/init` | Re-generate `CLAUDE.md` after structural changes |
| `/run` | Launch the dev server and verify the app in a browser |
| `/code-review` | Review pending changes for correctness and simplification |
| `/generate-portfolio-config` | Generate `portfolioConfig.js` entries from ticker data |

## Stack

- React 19 + Vite 8
- Recharts (donut charts)
- PapaParse (CSV parsing)
- Inline styles, no CSS framework
