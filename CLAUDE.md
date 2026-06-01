# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server with HMR
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint check
```

## Data input

The app fetches `/portfolio.csv` at runtime (from `public/portfolio.csv`). This file must be an **IBKR Flex Query CSV export** with at minimum these columns: `Symbol`, `Description`, `PercentOfNAV`, `SubCategory`, `CurrencyPrimary`. Rows where `SubCategory === "RIGHT"` or `PercentOfNAV` is blank are filtered out.

## Architecture

Everything lives in two source files:

- **`src/App.jsx`** — the entire UI: theme system, tab navigation, data parsing, chart rendering, and all component definitions. No routing library; tab state is local React state. Inline styles throughout (no CSS modules or Tailwind).
- **`src/portfolioConfig.js`** — a static lookup map keyed by ticker symbol. Each entry enriches a position with `type`, `sector`, `region`, `style`, and `cyclicality`. When a ticker is absent from this map, `App.jsx` falls back to IBKR's `SubCategory` for `type` and `"Egyéb"` ("Other") for the rest.

### Data flow

```
public/portfolio.csv  →  Papa.parse  →  parsePositions()  →  positions[]
portfolioConfig.js    ──────────────────────────────────────↗

positions[]  →  buildCharts()  →  computeChartData()  →  Recharts PieChart
             →  PositionsTable
             →  SizeTab (Core ≥5% / Satellite ≥2% / Micro <2% tiers)
```

### Tabs

`ALL_TABS` drives the tab bar. "Pozíciók" and "Méret" tabs are special-cased; all others map 1-to-1 to a `CHART_CONFIGS` key (`asset`, `sector`, `region`, `style`, `cyclicality`, `currency`). Each chart config specifies the grouping key on the position object and its color palette.

### Adding a new position

Add an entry to `portfolioConfig.js` using the exact ticker string that appears in the IBKR CSV `Symbol` column. Valid field values can be inferred from existing entries (e.g. region values: `"USA"`, `"Európa"`, `"Globális ETF/ETC"`, `"Magyarország / CEE"`).

### Theme

Two themes (`dark` / `light`) defined as plain objects in `THEMES`. Active theme object is passed as the prop `t` to every component — all color references go through `t.*`. Preference is persisted to `localStorage` under the key `portfolio-theme`.
