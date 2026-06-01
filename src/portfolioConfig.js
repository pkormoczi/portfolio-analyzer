const portfolioConfig = {
  // European stocks
  "NOVOBc": { sector: "Healthcare / Pharma",    region: "Európa",            style: "Growth",                  cyclicality: "Növekedési / Quality",    type: "Részvény" },
  "STGc":   { sector: "Consumer Staples",        region: "Európa",            style: "Dividend Income",          cyclicality: "Defenszív",               type: "Részvény" },
  "3RB0":   { sector: "Consumer Staples",        region: "Európa",            style: "Value / Quality",          cyclicality: "Defenszív",               type: "Részvény" },
  "UNA":    { sector: "Consumer Staples",        region: "Európa",            style: "Dividend Income",          cyclicality: "Defenszív",               type: "Részvény" },
  "BATSl":  { sector: "Consumer Staples",        region: "Európa",            style: "Dividend Income",          cyclicality: "Defenszív",               type: "Részvény" },
  // European ETFs
  "BNKE":   { sector: "Banking / Pénzügy",       region: "Európa",            style: "Dividend Income",          cyclicality: "Ciklikus",                type: "ETF" },
  "WDEF":   { sector: "Védelmi ipar",            region: "Európa",            style: "Tematikus (Defence)",      cyclicality: "Ciklikus",                type: "ETF" },
  "DXSA":   { sector: "Broad / Dividend",        region: "Európa",            style: "Dividend Income",          cyclicality: "Defenszív",               type: "ETF" },
  "SELD":   { sector: "Broad / Dividend",        region: "Európa",            style: "Dividend Income",          cyclicality: "Defenszív",               type: "ETF" },
  "IDVY":   { sector: "Broad / Dividend",        region: "Európa",            style: "Dividend Income",          cyclicality: "Defenszív",               type: "ETF" },
  // Global ETFs
  "AUCP":   { sector: "Nemesfém / Nyersanyag",   region: "Globális ETF/ETC",  style: "Nyersanyag / Infl. hedge", cyclicality: "Nyersanyag / Reál eszköz", type: "ETF" },
  "COPG":   { sector: "Nemesfém / Nyersanyag",   region: "Globális ETF/ETC",  style: "Nyersanyag / Infl. hedge", cyclicality: "Nyersanyag / Reál eszköz", type: "ETF" },
  "XAIX":   { sector: "Tech / AI",               region: "Globális ETF/ETC",  style: "Growth",                  cyclicality: "Ciklikus",                type: "ETF" },
  "IWFV":   { sector: "Broad / Dividend",        region: "Globális ETF/ETC",  style: "Value / Quality",          cyclicality: "Növekedési / Quality",    type: "ETF" },
  // ETC — IBKR SubCategory="ETF" but override to ETC
  "ISLN":   { sector: "Nemesfém / Nyersanyag",   region: "Globális ETF/ETC",  style: "Nyersanyag / Infl. hedge", cyclicality: "Nyersanyag / Reál eszköz", type: "ETC" },
  // Hungarian / CEE
  "OTP":    { sector: "Banking / Pénzügy",       region: "Magyarország / CEE", style: "Value / Quality",         cyclicality: "Ciklikus",                type: "Részvény" },
  // US stocks
  "MSFT":   { sector: "Tech / AI",               region: "USA",               style: "Growth",                  cyclicality: "Növekedési / Quality",    type: "Részvény" },
  "NVDA":   { sector: "Tech / AI",               region: "USA",               style: "Growth",                  cyclicality: "Ciklikus",                type: "Részvény" },
  "NOW":    { sector: "Tech / AI",               region: "USA",               style: "Growth",                  cyclicality: "Ciklikus",                type: "Részvény" },
  "LLY":    { sector: "Healthcare / Pharma",     region: "USA",               style: "Growth",                  cyclicality: "Növekedési / Quality",    type: "Részvény" },
  "UNH":    { sector: "Healthcare / Pharma",     region: "USA",               style: "Growth",                  cyclicality: "Növekedési / Quality",    type: "Részvény" },
  "IBKR":   { sector: "Banking / Pénzügy",       region: "USA",               style: "Growth",                  cyclicality: "Ciklikus",                type: "Részvény" },
  "CVX":    { sector: "Energia",                 region: "USA",               style: "Value / Quality",          cyclicality: "Ciklikus",                type: "Részvény" },
  "KO":     { sector: "Consumer Staples",        region: "USA",               style: "Dividend Income",          cyclicality: "Defenszív",               type: "Részvény" },
};

export default portfolioConfig;