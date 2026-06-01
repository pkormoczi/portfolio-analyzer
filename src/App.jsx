import { useState, useEffect } from "react";
import Papa from "papaparse";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import portfolioConfig from "./portfolioConfig.js";

const THEMES = {
  dark: {
    bg:           "#080c14",
    card:         "#0d1117",
    cardAlt:      "#0a0f1a",
    headerBox:    "#0f1621",
    border:       "#151d2e",
    borderAlt:    "#1e2a3a",
    text:         "#e8edf5",
    textSub:      "#c8d4e8",
    textMuted:    "#4a5878",
    textFaint:    "#2a3d5a",
    tabInactive:  "#0f1621",
    spinnerTrack: "#151d2e",
  },
  light: {
    bg:           "#f0f4f9",
    card:         "#ffffff",
    cardAlt:      "#f7f9fc",
    headerBox:    "#eef2f9",
    border:       "#dde3ef",
    borderAlt:    "#c8d3e5",
    text:         "#111827",
    textSub:      "#374151",
    textMuted:    "#6b7a99",
    textFaint:    "#9aaabe",
    tabInactive:  "#e8eef8",
    spinnerTrack: "#dde3ef",
  },
};

const TIERS = [
  { key: "core",      label: "Core",      min: 5, color: "#00c896" },
  { key: "satellite", label: "Satellite", min: 2, color: "#4a8fff" },
  { key: "micro",     label: "Micro",     min: 0, color: "#ff4d6d" },
];

const TYPE_COLORS = {
  "Részvény": "#00c896",
  "ETF":      "#4a8fff",
  "ETC":      "#f5a623",
  "Egyéb":    "#b88cff",
};

const CHART_CONFIGS = {
  asset: {
    label: "Eszköztípus",
    sub: "Egyedi részvény vs. passzív struktúrák",
    key: "type",
    colors: ["#00c896", "#4a8fff", "#f5a623", "#b88cff", "#ff9f43"],
  },
  sector: {
    label: "Szektor",
    sub: "Szektoros koncentráció",
    key: "sector",
    colors: ["#ff4d6d", "#4a8fff", "#00c896", "#f5a623", "#b88cff", "#5ec8e5", "#ff9f43", "#e84393"],
  },
  region: {
    label: "Régió",
    sub: "Földrajzi kitettség",
    key: "region",
    colors: ["#4a8fff", "#f5a623", "#00c896", "#ff4d6d", "#b88cff"],
  },
  style: {
    label: "Stílus",
    sub: "Befektetési stílus szerinti bontás",
    key: "style",
    colors: ["#4a8fff", "#00c896", "#f5a623", "#b88cff", "#ff9f43"],
  },
  cyclicality: {
    label: "Ciklikusság",
    sub: "Makróérzékenység szerinti bontás",
    key: "cyclicality",
    colors: ["#ff4d6d", "#4a8fff", "#00c896", "#f5a623"],
  },
  currency: {
    label: "Deviza",
    sub: "Mögöttes devizakitettség",
    key: "currency",
    colors: ["#4a8fff", "#00c896", "#ff4d6d", "#f5a623", "#5ec8e5"],
  },
};

const ALL_TABS = [
  { key: "positions", label: "Pozíciók" },
  { key: "size",      label: "Méret" },
  ...Object.entries(CHART_CONFIGS).map(([key, val]) => ({ key, label: val.label })),
];

function parsePositions(rows) {
  return rows
    .filter(r => r.PercentOfNAV?.trim() && r.SubCategory !== "RIGHT")
    .map(r => {
      const ticker = r.Symbol;
      const cfg = portfolioConfig[ticker];
      const subCatType = r.SubCategory === "ETF" ? "ETF" : "Részvény";
      return {
        ticker,
        name: r.Description,
        rawValue: parseFloat(r.PercentOfNAV),
        currency: r.CurrencyPrimary,
        type:        cfg?.type        ?? subCatType,
        sector:      cfg?.sector      ?? "Egyéb",
        region:      cfg?.region      ?? "Egyéb",
        style:       cfg?.style       ?? "Egyéb",
        cyclicality: cfg?.cyclicality ?? "Egyéb",
      };
    })
    .sort((a, b) => b.rawValue - a.rawValue);
}

function computeChartData(positions, key) {
  const groups = {};
  for (const pos of positions) {
    const val = pos[key];
    if (!groups[val]) groups[val] = { name: val, value: 0, tickers: [] };
    groups[val].value += pos.rawValue;
    groups[val].tickers.push(pos.ticker);
  }
  return Object.values(groups)
    .map(g => ({ name: g.name, value: parseFloat(g.value.toFixed(2)), tickers: g.tickers.join(" · ") }))
    .sort((a, b) => b.value - a.value);
}

function buildCharts(positions) {
  const result = {};
  for (const [key, cfg] of Object.entries(CHART_CONFIGS)) {
    result[key] = { ...cfg, data: computeChartData(positions, cfg.key) };
  }
  return result;
}


const CustomTooltip = ({ active, payload, t }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = payload[0].fill;
  return (
    <div style={{
      background: t.card,
      border: `1px solid ${color}55`,
      borderLeft: `3px solid ${color}`,
      padding: "10px 14px",
      borderRadius: 6,
      fontFamily: "monospace",
      fontSize: 12,
      boxShadow: `0 4px 24px ${color}22`,
    }}>
      <div style={{ color: t.text, fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
      <div style={{ color, fontSize: 18, fontWeight: 800 }}>
        {d.value.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400 }}>%</span>
      </div>
      {d.tickers && (
        <div style={{ color: t.textFaint, marginTop: 6, fontSize: 10, lineHeight: 1.5 }}>{d.tickers}</div>
      )}
    </div>
  );
};

const POS_COLS = "32px 70px 1fr 90px 80px";

function PositionsTable({ positions, t }) {
  const maxVal = Math.max(...positions.map(p => p.rawValue));
  const total = positions.reduce((s, p) => s + p.rawValue, 0);
  return (
    <div style={{
      background: t.card,
      borderRadius: 12,
      border: `1px solid ${t.border}`,
      overflow: "hidden",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: POS_COLS,
        padding: "10px 20px",
        borderBottom: `1px solid ${t.border}`,
        fontSize: 9,
        color: t.textMuted,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}>
        <span>#</span>
        <span>Ticker</span>
        <span>Név</span>
        <span style={{ textAlign: "right" }}>Súly</span>
        <span style={{ textAlign: "right" }}>Típus</span>
      </div>

      {positions.map((pos, i) => {
        const barWidth = (pos.rawValue / maxVal) * 100;
        const typeColor = TYPE_COLORS[pos.type] ?? TYPE_COLORS["Egyéb"];
        return (
          <div
            key={pos.ticker}
            style={{
              display: "grid",
              gridTemplateColumns: POS_COLS,
              padding: "11px 20px",
              borderBottom: `1px solid ${t.border}`,
              background: i % 2 === 0 ? t.card : t.cardAlt,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "monospace" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: typeColor, fontFamily: "monospace", letterSpacing: 0.5 }}>
              {pos.ticker}
            </span>
            <div style={{ paddingRight: 12 }}>
              <div style={{ fontSize: 12, color: t.textSub, marginBottom: 4 }}>{pos.name}</div>
              <div style={{ background: t.border, borderRadius: 2, height: 3 }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${typeColor}99, ${typeColor}33)`,
                  borderRadius: 2,
                }} />
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "monospace", textAlign: "right" }}>
              {pos.rawValue.toFixed(2)}%
            </span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: typeColor,
                background: `${typeColor}18`,
                border: `1px solid ${typeColor}44`,
                borderRadius: 4,
                padding: "2px 7px",
                letterSpacing: 0.5,
                fontFamily: "monospace",
              }}>
                {pos.type}
              </span>
            </div>
          </div>
        );
      })}

      <div style={{
        display: "grid",
        gridTemplateColumns: POS_COLS,
        padding: "10px 20px",
        borderTop: `1px solid ${t.borderAlt}`,
        background: t.bg,
      }}>
        <span /><span />
        <span style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", alignSelf: "center" }}>
          {positions.length} pozíció összesen
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#f5a623", fontFamily: "monospace", textAlign: "right" }}>
          {total.toFixed(2)}%
        </span>
        <span />
      </div>
    </div>
  );
}

function SizeTab({ positions, t }) {
  const total = positions.reduce((s, p) => s + p.rawValue, 0);

  const tieredGroups = TIERS.map(tier => ({ ...tier, positions: [], sumPct: 0 }));
  for (const pos of positions) {
    const group = tieredGroups.find(g => pos.rawValue >= g.min) ?? tieredGroups[tieredGroups.length - 1];
    group.positions.push(pos);
    group.sumPct += pos.rawValue;
  }

  const chartData = tieredGroups.map(g => ({
    name: g.label,
    value: parseFloat(g.sumPct.toFixed(2)),
    tickers: g.positions.map(p => p.ticker).join(" · "),
  }));
  const chartColors = tieredGroups.map(g => g.color);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Donut + breakdown — same layout as other tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, alignItems: "start" }}>

        {/* Donut Chart */}
        <div style={{ background: t.card, borderRadius: 12, padding: "20px 16px", border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>Méret</div>
          <div style={{ fontSize: 12, color: t.textFaint, marginBottom: 16 }}>Pozíciók méret szerinti bontása</div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "monospace", lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, marginTop: 4, fontFamily: "monospace" }}>PORTFÓLIÓ</div>
            </div>
            <PieChart width={300} height={280}>
              <Pie data={chartData} cx={150} cy={140} innerRadius={80} outerRadius={125} paddingAngle={2.5} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                {chartData.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
              </Pie>
              <Tooltip content={(props) => <CustomTooltip {...props} t={t} />} wrapperStyle={{ zIndex: 10 }} />
            </PieChart>
          </div>
        </div>

        {/* Bar breakdown */}
        <div style={{ background: t.card, borderRadius: 12, padding: "20px", border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
            Részletes bontás — Méret
          </div>
          {tieredGroups.map(group => (
            <div key={group.key} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: group.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: t.textSub, fontWeight: 600 }}>{group.label}</span>
                </div>
                <span style={{ fontSize: 14, color: group.color, fontWeight: 800 }}>{group.sumPct.toFixed(1)}%</span>
              </div>
              <div style={{ background: t.border, borderRadius: 3, height: 4, overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(90deg, ${group.color}cc, ${group.color}55)`, width: `${group.sumPct}%`, height: "100%", borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: t.textFaint, marginTop: 3 }}>
                {group.positions.map(p => p.ticker).join(" · ")}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: 2 }}>ÖSSZESEN</span>
            <span style={{ fontSize: 14, color: "#f5a623", fontWeight: 800 }}>100.00%</span>
          </div>
        </div>
      </div>

      {/* Tier cards */}
      {tieredGroups.map(group => (
        <div key={group.key} style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>

          {/* Card header */}
          <div style={{ padding: "14px 20px", borderBottom: group.positions.length > 0 ? `1px solid ${t.border}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: group.color, fontFamily: "monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  {group.label}
                </span>
                <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "monospace", letterSpacing: 1 }}>
                  {group.positions.length} pozíció
                </span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: group.color, fontFamily: "monospace" }}>
                {group.sumPct.toFixed(1)}%
              </span>
            </div>
            <div style={{ background: t.border, borderRadius: 2, height: 3, overflow: "hidden" }}>
              <div style={{
                width: `${(group.sumPct / total) * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${group.color}cc, ${group.color}44)`,
                borderRadius: 2,
              }} />
            </div>
            {group.key === "micro" && group.positions.length > 0 && (
              <div style={{ marginTop: 9, fontSize: 10, color: "#f5a623", fontFamily: "monospace" }}>
                ⚠ {group.positions.length} mikropozíció, együtt csak {group.sumPct.toFixed(1)}% — cleanup jelöltek
              </div>
            )}
          </div>

          {/* Position rows */}
          {group.positions.map((pos, i) => (
            <div
              key={pos.ticker}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 20px",
                borderBottom: i < group.positions.length - 1 ? `1px solid ${t.border}` : "none",
                background: i % 2 === 0 ? t.card : t.cardAlt,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: group.color, fontFamily: "monospace", width: 72, flexShrink: 0 }}>
                {pos.ticker}
              </span>
              <span style={{ fontSize: 11, color: t.textMuted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pos.name}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.text, fontFamily: "monospace", flexShrink: 0 }}>
                {pos.rawValue.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PortfolioAnalysis() {
  const [positions, setPositions] = useState(null);
  const [active, setActive] = useState("positions");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("portfolio-theme") ?? "dark"
  );

  const t = THEMES[theme];

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("portfolio-theme", next);
  }

  useEffect(() => {
    fetch("/portfolio.csv")
      .then(r => r.text())
      .then(text => {
        const { data } = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: h => h.trim(),
        });
        setPositions(parsePositions(data));
      });
  }, []);

  if (positions === null) {
    return (
      <div style={{
        background: t.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', Courier, monospace",
        color: t.textMuted,
        gap: 16,
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${t.spinnerTrack}`,
          borderTop: "3px solid #4a8fff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Betöltés...</div>
      </div>
    );
  }

  const charts = buildCharts(positions);
  const isPositions = active === "positions";
  const isSize = active === "size";
  const chart = (!isPositions && !isSize) ? charts[active] : null;
  const chartData = chart ? chart.data : [];
  const totalExposure = positions.reduce((s, p) => s + p.rawValue, 0);

  return (
    <div style={{
      background: t.bg,
      minHeight: "100vh",
      padding: "28px 20px",
      fontFamily: "'Courier New', Courier, monospace",
      color: t.text,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, borderBottom: `1px solid ${t.border}`, paddingBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: "#4a8fff", letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>
              ▸ PORTFOLIO ANALYSIS
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, color: t.text }}>
              Kitettség elemzés
            </div>
            <div style={{ fontSize: 11, color: t.textFaint, marginTop: 4 }}>
              {positions.length} pozíció · IBKR margin account
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                padding: "5px 12px",
                border: `1px solid ${t.border}`,
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 1,
                background: t.headerBox,
                color: t.textMuted,
                transition: "all 0.15s",
              }}
            >
              {theme === "dark" ? "☀ LIGHT" : "☾ DARK"}
            </button>

            {/* Exposure box */}
            <div style={{
              background: t.headerBox,
              border: "1px solid #f5a62333",
              borderRadius: 8,
              padding: "10px 16px",
              textAlign: "right",
            }}>
              <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Összes kitettség</div>
              <div style={{ fontSize: 24, color: "#f5a623", fontWeight: 800, lineHeight: 1.2 }}>~{totalExposure.toFixed(0)}%</div>
              <div style={{ fontSize: 9, color: t.textFaint }}>NETLIQ · PercentOfNAV</div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {ALL_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              style={{
                padding: "7px 14px",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                transition: "all 0.15s",
                background: active === key ? "#4a8fff" : t.tabInactive,
                color: active === key ? "#fff" : t.textMuted,
                borderBottom: active === key ? "2px solid #00c896" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {isPositions ? (
          <PositionsTable positions={positions} t={t} />
        ) : isSize ? (
          <SizeTab positions={positions} t={t} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, alignItems: "start" }}>

            {/* Donut Chart */}
            <div style={{
              background: t.card,
              borderRadius: 12,
              padding: "20px 16px",
              border: `1px solid ${t.border}`,
            }}>
              <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>{chart.label}</div>
              <div style={{ fontSize: 12, color: t.textFaint, marginBottom: 16 }}>{chart.sub}</div>
              <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                {/* Rendered before PieChart so tooltip (inside PieChart) stacks on top */}
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "monospace", lineHeight: 1 }}>100%</div>
                  <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, marginTop: 4, fontFamily: "monospace" }}>PORTFÓLIÓ</div>
                </div>
                <PieChart width={300} height={280}>
                  <Pie
                    data={chartData}
                    cx={150} cy={140}
                    innerRadius={80} outerRadius={125}
                    paddingAngle={2.5}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={chart.colors[i % chart.colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => <CustomTooltip {...props} t={t} />}
                    wrapperStyle={{ zIndex: 10 }}
                  />
                </PieChart>
              </div>
            </div>

            {/* Bar table */}
            <div style={{
              background: t.card,
              borderRadius: 12,
              padding: "20px",
              border: `1px solid ${t.border}`,
            }}>
              <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
                Részletes bontás — {chart.label}
              </div>
              {chartData.map((item, i) => {
                const color = chart.colors[i % chart.colors.length];
                return (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: t.textSub, fontWeight: 600 }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: 14, color, fontWeight: 800 }}>{item.value.toFixed(1)}%</span>
                    </div>
                    <div style={{ background: t.border, borderRadius: 3, height: 4, overflow: "hidden" }}>
                      <div style={{
                        background: `linear-gradient(90deg, ${color}cc, ${color}55)`,
                        width: `${item.value}%`,
                        height: "100%",
                        borderRadius: 3,
                      }} />
                    </div>
                    {item.tickers && (
                      <div style={{ fontSize: 10, color: t.textFaint, marginTop: 3 }}>{item.tickers}</div>
                    )}
                  </div>
                );
              })}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 12,
                borderTop: `1px solid ${t.border}`,
              }}>
                <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: 2 }}>ÖSSZESEN</span>
                <span style={{ fontSize: 14, color: "#f5a623", fontWeight: 800 }}>100.00%</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 16, padding: "10px 16px", background: t.card, borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 10, color: t.textFaint }}>
          ℹ Adatok forrása: IBKR Flex Query (public/portfolio.csv)
        </div>
      </div>
    </div>
  );
}
