# Generate Portfolio Config

Automatically categorize new positions from the IBKR CSV export
and update portfolioConfig.js. Existing entries are never modified.

## Steps

1. Read `public/portfolio.csv`
2. Read `src/portfolioConfig.js` and collect all tickers already mapped
3. For each row in the CSV:
   - Skip if PercentOfNAV is empty or blank
   - Skip if SubCategory === "RIGHT"
   - Skip if ticker already exists in portfolioConfig
4. For each NEW ticker, determine all 5 fields using your knowledge
5. Append new entries to src/portfolioConfig.js

## Valid values — use EXACTLY these strings

**sector**
- `"Banking / Pénzügy"`
- `"Tech / AI"`
- `"Healthcare / Pharma"`
- `"Consumer Staples"`
- `"Nemesfém / Nyersanyag"`
- `"Broad / Dividend"`
- `"Védelmi ipar"`
- `"Energia"`
- `"Egyéb"`

**region**
- `"Európa"`
- `"USA"`
- `"Magyarország / CEE"`
- `"Globális ETF/ETC"`

**style**
- `"Growth"`
- `"Value / Quality"`
- `"Dividend Income"`
- `"Nyersanyag / Infl. hedge"`
- `"Tematikus (Defence)"`
- `"Egyéb"`

**cyclicality**
- `"Ciklikus"`
- `"Növekedési / Quality"`
- `"Defenszív"`
- `"Nyersanyag / Reál eszköz"`
- `"Egyéb"`

**type**
- `"ETF"` — if SubCategory is ETF and it tracks an index/basket
- `"ETC"` — if it is a physically backed commodity product (gold, silver, copper)
- `"Részvény"` — individual stocks (SubCategory: COMMON, or any non-ETF/ETC)

## Categorization rules

Use your training knowledge of the company or fund. Key heuristics:

**Type resolution**
- SubCategory === "ETF" but Description contains "PHYSICAL" → override to "ETC"
- SubCategory === "ETF" but it is a physically backed metal product → override to "ETC"
- SubCategory === "COMMON" → "Részvény"

**Region**
- Listed on NASDAQ/NYSE, USD currency → "USA"
- Listed on BUX, HUF currency → "Magyarország / CEE"
- Listed on CPH/LSE/AEB/SBF/IBIS/IBIS2, EUR/GBP/DKK currency → "Európa"
- Global index ETF (MSCI World, S&P 500, global themes) → "Globális ETF/ETC"

**Sector hints from Description keywords**
- BANK, FINANCIAL → "Banking / Pénzügy"
- GOLD MINING, SILVER, COPPER, METAL → "Nemesfém / Nyersanyag"
- DEFENCE, DEFENSE → "Védelmi ipar"
- TOBACCO, CONSUMER, FOOD, BEVERAGE, HOUSEHOLD → "Consumer Staples"
- PHARMA, HEALTH, BIOTECH, LILLY, NOVO → "Healthcare / Pharma"
- ARTIFICIAL INTEL, SOFTWARE, NVIDIA, MICROSOFT, TECH → "Tech / AI"
- DIVIDEND (ETF) → "Broad / Dividend"
- OIL, GAS, ENERGY, CHEVRON → "Energia"
- SERVICENOW, CLOUD, SaaS → "Tech / AI"

**Style hints**
- ETF name contains DIVIDEND → "Dividend Income"
- ETF name contains VALUE → "Value / Quality"
- ETF name contains DEFENCE → "Tematikus (Defence)"
- Physical commodity ETC/ETF → "Nyersanyag / Infl. hedge"
- Gold/silver/copper miners ETF → "Nyersanyag / Infl. hedge"
- High-growth US tech (NVDA, NOW, MSFT) → "Growth"
- Tobacco, consumer staples with high yield → "Dividend Income"
- Banks in emerging/value markets → "Value / Quality"
- Pharma with strong pipeline and high P/E → "Growth"

**Cyclicality hints**
- Banking, tech, energy, defence → "Ciklikus"
- Consumer staples, tobacco, utilities, dividend ETFs → "Defenszív"
- Quality growth pharma, quality tech (MSFT) → "Növekedési / Quality"
- Commodity, precious metals, miners → "Nyersanyag / Reál eszköz"

## Output format

Append to src/portfolioConfig.js in this exact format.
Add a comment with today's date above the new block:

```javascript
// Added: YYYY-MM-DD
"TICKER": { sector: "...", region: "...", style: "...", cyclicality: "...", type: "..." },
```

Do NOT modify any existing entries.
Do NOT reformat or reorder the existing file.
After writing, print a summary of how many tickers were added
and list them with their assigned categories so the user can review.
