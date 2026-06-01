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

## `/generate-portfolio-config` skill

The skill reads `public/portfolio.csv`, compares every ticker against the existing `src/portfolioConfig.js`, and **appends entries only for tickers that are not yet mapped**. Existing entries are never touched.

### When to use it

Run it after every IBKR export that contains new positions. The app silently falls back to `"Egyéb"` for unknown tickers, so charts will have an inflated "Other" slice until they are mapped.

### How to invoke

Type the following in Claude Code:

```
/generate-portfolio-config
```

No arguments needed. The skill picks up `public/portfolio.csv` automatically.

### What it produces

For each new ticker it uses its knowledge of the company or fund to fill in five fields and appends a dated block to `portfolioConfig.js`:

```js
// Added: 2026-06-01
"AAPL": { sector: "Tech / AI", region: "USA", style: "Growth", cyclicality: "Növekedési / Quality", type: "Részvény" },
```

After writing, it prints a summary table so you can review every assignment before committing.

### Valid field values

| Field | Allowed values |
|---|---|
| `type` | `"Részvény"` · `"ETF"` · `"ETC"` |
| `sector` | `"Tech / AI"` · `"Banking / Pénzügy"` · `"Healthcare / Pharma"` · `"Consumer Staples"` · `"Nemesfém / Nyersanyag"` · `"Broad / Dividend"` · `"Védelmi ipar"` · `"Energia"` · `"Egyéb"` |
| `region` | `"USA"` · `"Európa"` · `"Magyarország / CEE"` · `"Globális ETF/ETC"` |
| `style` | `"Growth"` · `"Value / Quality"` · `"Dividend Income"` · `"Nyersanyag / Infl. hedge"` · `"Tematikus (Defence)"` · `"Egyéb"` |
| `cyclicality` | `"Növekedési / Quality"` · `"Ciklikus"` · `"Defenszív"` · `"Nyersanyag / Reál eszköz"` · `"Egyéb"` |

Using a value not in the table above will cause the position to appear under `"Egyéb"` in every chart that uses that dimension.

### Type overrides

The skill overrides IBKR's `SubCategory` in two cases:

- `SubCategory = ETF` **and** the product is physically backed (gold, silver, copper) → `"ETC"`
- `SubCategory = COMMON` → always `"Részvény"`

### Manual corrections

If an auto-assigned category is wrong, edit `src/portfolioConfig.js` directly. The skill will never overwrite a key that already exists, so your correction is safe across future runs.

## Stack

- React 19 + Vite 8
- Recharts (donut charts)
- PapaParse (CSV parsing)
- Inline styles, no CSS framework
