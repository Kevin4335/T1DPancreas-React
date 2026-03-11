import React, { useState, useCallback } from 'react';
import { keyframes } from '@emotion/react';
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

const slideUpIn = keyframes`
  0% { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// ── Gene list (autocomplete + dot data) ───────────────────
const GENE_LIST = ['BAX', 'CD8A', 'CDKN1A', 'FOXP3', 'GCG', 'HLA-A', 'INS', 'IRF1', 'PPY', 'PTPRC', 'SST', 'STAT1'];
const QUICK_CHIPS = ['INS', 'GCG', 'SST', 'PPY', 'CD8A', 'FOXP3', 'HLA-A', 'STAT1', 'IRF1', 'CDKN1A'];

// ── Cell type colours ────────────────────────────────────
const CELL_COLORS = {
  'Acinar': '#f97316',
  'Alpha': '#22c55e',
  'B cells': '#a855f7',
  'Beta': '#3b82f6',
  'Delta': '#06b6d4',
  'Ductal': '#84cc16',
  'Endothelial': '#f43f5e',
  'Granulocytes': '#d97706',
  'Macrophages': '#6366f1',
  'Dendritic cells': '#10b981',
  'Monocytes': '#ec4899',
  'NK cells': '#14b8a6',
  'Pre-B cells': '#8b5cf6',
  'T cells': '#ef4444',
  'Mesenchymal': '#78716c',
  'Unknown': '#94a3b8',
};
const CELL_TYPES = Object.keys(CELL_COLORS);

// ── UMAP cluster centres ─────────────────────────────────
const CENTERS = {
  'Beta': [2.6, 3.1], 'Alpha': [-2.1, 3.6],
  'Delta': [-0.9, 5.6], 'Ductal': [4.6, -1.4],
  'Acinar': [5.6, 1.1], 'Endothelial': [0.4, -4.1],
  'T cells': [-4.6, -1.4], 'B cells': [-6.1, 0.6],
  'Macrophages': [-5.1, -3.4], 'Dendritic cells': [-3.1, -5.1],
  'Monocytes': [-6.6, -5.1], 'NK cells': [-4.1, 2.6],
  'Pre-B cells': [-6.6, 3.1], 'Granulocytes': [3.1, -4.6],
  'Mesenchymal': [6.6, -3.4], 'Unknown': [1.6, -6.6],
};
const COUNTS = {
  'Beta': 55, 'Alpha': 45, 'Delta': 25, 'Ductal': 30, 'Acinar': 40,
  'Endothelial': 20, 'T cells': 35, 'B cells': 25, 'Macrophages': 30,
  'Dendritic cells': 20, 'Monocytes': 20, 'NK cells': 25, 'Pre-B cells': 20,
  'Granulocytes': 20, 'Mesenchymal': 25, 'Unknown': 30,
};

function makeRand(seed) {
  let s = seed >>> 0;
  return () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 4294967296; };
}

const UMAP_PTS = (() => {
  const rand = makeRand(42);
  const pts = [];
  CELL_TYPES.forEach((ct) => {
    const [cx, cy] = CENTERS[ct];
    for (let i = 0; i < COUNTS[ct]; i++) {
      const u1 = Math.max(rand(), 1e-10);
      const u2 = rand();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      pts.push({ x: cx + z1 * 0.75, y: cy + z2 * 0.75, ct });
    }
  });
  return pts;
})();

// ── Dot plot mock data ───────────────────────────────────
const CONDITIONS = ['AB⁺LN⁻', 'AB⁺LN⁺', 'Control', 'T1D'];
const DOT_DATA = {
  BAX: { 'AB⁺LN⁻': { pct: 10.2, avg: 0.30 }, 'AB⁺LN⁺': { pct: 11.5, avg: 0.60 }, 'Control': { pct: 9.1, avg: -0.10 }, 'T1D': { pct: 12.8, avg: 0.90 } },
  CD8A: { 'AB⁺LN⁻': { pct: 11.8, avg: 0.80 }, 'AB⁺LN⁺': { pct: 12.3, avg: 0.95 }, 'Control': { pct: 9.2, avg: -0.30 }, 'T1D': { pct: 13.0, avg: 1.00 } },
  CDKN1A: { 'AB⁺LN⁻': { pct: 10.3, avg: 0.20 }, 'AB⁺LN⁺': { pct: 10.8, avg: 0.40 }, 'Control': { pct: 9.5, avg: -0.20 }, 'T1D': { pct: 11.2, avg: 0.50 } },
  FOXP3: { 'AB⁺LN⁻': { pct: 10.5, avg: 0.40 }, 'AB⁺LN⁺': { pct: 11.1, avg: 0.60 }, 'Control': { pct: 9.0, avg: -0.40 }, 'T1D': { pct: 12.0, avg: 0.80 } },
  GCG: { 'AB⁺LN⁻': { pct: 9.8, avg: 0.10 }, 'AB⁺LN⁺': { pct: 10.4, avg: 0.40 }, 'Control': { pct: 11.0, avg: 0.30 }, 'T1D': { pct: 10.7, avg: 0.50 } },
  'HLA-A': { 'AB⁺LN⁻': { pct: 12.5, avg: 0.90 }, 'AB⁺LN⁺': { pct: 12.8, avg: 0.95 }, 'Control': { pct: 10.0, avg: 0.10 }, 'T1D': { pct: 13.0, avg: 1.00 } },
  INS: { 'AB⁺LN⁻': { pct: 11.2, avg: 0.50 }, 'AB⁺LN⁺': { pct: 10.0, avg: 0.20 }, 'Control': { pct: 12.5, avg: 0.80 }, 'T1D': { pct: 9.3, avg: -0.30 } },
  IRF1: { 'AB⁺LN⁻': { pct: 9.8, avg: 0.30 }, 'AB⁺LN⁺': { pct: 10.5, avg: 0.50 }, 'Control': { pct: 9.2, avg: -0.20 }, 'T1D': { pct: 11.5, avg: 0.70 } },
  PPY: { 'AB⁺LN⁻': { pct: 9.5, avg: -0.10 }, 'AB⁺LN⁺': { pct: 9.8, avg: 0.20 }, 'Control': { pct: 10.5, avg: 0.40 }, 'T1D': { pct: 9.2, avg: -0.20 } },
  PTPRC: { 'AB⁺LN⁻': { pct: 12.1, avg: 0.70 }, 'AB⁺LN⁺': { pct: 12.9, avg: 0.95 }, 'Control': { pct: 9.5, avg: -0.40 }, 'T1D': { pct: 13.0, avg: 1.00 } },
  SST: { 'AB⁺LN⁻': { pct: 9.5, avg: 0.20 }, 'AB⁺LN⁺': { pct: 10.2, avg: 0.30 }, 'Control': { pct: 10.8, avg: 0.50 }, 'T1D': { pct: 9.8, avg: 0.10 } },
  STAT1: { 'AB⁺LN⁻': { pct: 11.0, avg: 0.60 }, 'AB⁺LN⁺': { pct: 11.5, avg: 0.75 }, 'Control': { pct: 9.3, avg: -0.30 }, 'T1D': { pct: 12.5, avg: 0.90 } },
};

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
function expColor(v) {
  const t = Math.max(0, Math.min(1, (v + 0.5) / 1.5));
  if (t < 0.5) {
    const s = t * 2;
    return `rgb(${lerp(255, 249, s)},${lerp(237, 115, s)},${lerp(153, 22, s)})`;
  }
  const s = (t - 0.5) * 2;
  return `rgb(${lerp(249, 185, s)},${lerp(115, 28, s)},${lerp(22, 28, s)})`;
}
function pctR(v) { return 8 + ((v - 9) / 4) * 8; }

// ── UMAP chart (static) ─────────────────────────────────
function UMAPPlot() {
  const W = 550;
  const H = 450;
  const ml = 46;
  const mr = 164;
  const mt = 14;
  const mb = 38;
  const pw = W - ml - mr;
  const ph = H - mt - mb;

  const xs = UMAP_PTS.map((p) => p.x);
  const ys = UMAP_PTS.map((p) => p.y);
  const xMin = Math.min(...xs) - 0.6;
  const xMax = Math.max(...xs) + 0.6;
  const yMin = Math.min(...ys) - 0.6;
  const yMax = Math.max(...ys) + 0.6;
  const sx = (v) => ml + ((v - xMin) / (xMax - xMin)) * pw;
  const sy = (v) => mt + ph - ((v - yMin) / (yMax - yMin)) * ph;
  const xTicks = [-6, -4, -2, 0, 2, 4, 6].filter((v) => v > xMin && v < xMax);
  const yTicks = [-6, -4, -2, 0, 2, 4, 6].filter((v) => v > yMin && v < yMax);

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2.5, flex: '0 0 auto' }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'navy.main', mb: 1.25, fontFamily: 'Inter, sans-serif' }}>
        UMAP — Cell Type Distribution
      </Typography>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {xTicks.map((v) => <line key={v} x1={sx(v)} y1={mt} x2={sx(v)} y2={mt + ph} stroke="#f0f0f0" strokeWidth={1} />)}
        {yTicks.map((v) => <line key={v} x1={ml} y1={sy(v)} x2={ml + pw} y2={sy(v)} stroke="#f0f0f0" strokeWidth={1} />)}
        <line x1={ml} y1={mt} x2={ml} y2={mt + ph} stroke="#e5e7eb" strokeWidth={1} />
        <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="#e5e7eb" strokeWidth={1} />
        {xTicks.map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={mt + ph} x2={sx(v)} y2={mt + ph + 4} stroke="#d1d5db" />
            <text x={sx(v)} y={mt + ph + 14} textAnchor="middle" fontSize={9} fill="#4b5563" fontFamily="JetBrains Mono, monospace">{v}</text>
          </g>
        ))}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={ml - 4} y1={sy(v)} x2={ml} y2={sy(v)} stroke="#d1d5db" />
            <text x={ml - 7} y={sy(v) + 3} textAnchor="end" fontSize={9} fill="#4b5563" fontFamily="JetBrains Mono, monospace">{v}</text>
          </g>
        ))}
        <text x={ml + pw / 2} y={H - 5} textAnchor="middle" fontSize={10} fill="#4b5563" fontStyle="italic" fontFamily="JetBrains Mono, monospace">UMAP 1</text>
        <text x={11} y={mt + ph / 2} textAnchor="middle" fontSize={10} fill="#4b5563" fontStyle="italic" fontFamily="JetBrains Mono, monospace" transform={`rotate(-90,11,${mt + ph / 2})`}>UMAP 2</text>
        {UMAP_PTS.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill={CELL_COLORS[p.ct]} opacity={0.78} />
        ))}
        {CELL_TYPES.map((ct, i) => (
          <g key={ct}>
            <circle cx={ml + pw + 14} cy={mt + i * 24 + 8} r={5} fill={CELL_COLORS[ct]} />
            <text x={ml + pw + 24} y={mt + i * 24 + 12} fontSize={10} fill="#374151" fontFamily="Inter, sans-serif">{ct}</text>
          </g>
        ))}
      </svg>
    </Card>
  );
}

// ── Dot plot (updates with gene) ───────────────────────────
function DotPlot({ gene }) {
  const W = 430;
  const H = 450;
  const ml = 80;
  const mr = 28;
  const mt = 24;
  const mb = 108;
  const pw = W - ml - mr;
  const ph = H - mt - mb;
  const colW = pw / CONDITIONS.length;
  const midY = mt + ph / 2;
  const colX = (i) => ml + (i + 0.5) * colW;

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2.5, flex: '1 1 430px', minWidth: 430 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'navy.main', mb: 1.25, fontFamily: 'Inter, sans-serif' }}>
        Dot Plot — {gene} by Condition
      </Typography>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        style={{ display: 'block' }}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="expGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={expColor(-0.5)} />
            <stop offset="50%" stopColor={expColor(0.25)} />
            <stop offset="100%" stopColor={expColor(1.0)} />
          </linearGradient>
        </defs>
        <rect x={ml} y={mt} width={pw} height={ph} fill="#f8fafc" rx={2} />
        <line x1={ml} y1={mt} x2={ml + pw} y2={mt} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="#cbd5e1" strokeWidth={1} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={ml + i * colW} y1={mt} x2={ml + i * colW} y2={mt + ph} stroke="#cbd5e1" strokeWidth={1} />
        ))}
        <text x={ml - 10} y={midY + 4} textAnchor="end" fontSize={12} fontWeight="700" fill="#1e3a5f" fontFamily="JetBrains Mono, monospace">{gene}</text>
        {CONDITIONS.map((c, i) => (
          <text key={c} x={colX(i)} y={mt + ph + 18} textAnchor="middle" fontSize={10} fill="#374151" fontFamily="Inter, sans-serif">{c}</text>
        ))}
        {CONDITIONS.map((c, i) => {
          const d = DOT_DATA[gene]?.[c];
          if (!d) return null;
          return <circle key={c} cx={colX(i)} cy={midY} r={pctR(d.pct)} fill={expColor(d.avg)} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />;
        })}
        <text x={ml} y={mt + ph + 46} fontSize={9} fill="#4b5563" fontFamily="Inter, sans-serif">% expressing:</text>
        {[9, 11, 13].map((v, i) => (
          <g key={v}>
            <circle cx={ml + 18 + i * 54} cy={mt + ph + 66} r={pctR(v)} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
            <text x={ml + 18 + i * 54} y={mt + ph + 84} textAnchor="middle" fontSize={8} fill="#4b5563" fontFamily="Inter, sans-serif">{v}%</text>
          </g>
        ))}
        <text x={W - 126} y={mt + ph + 46} fontSize={9} fill="#4b5563" fontFamily="Inter, sans-serif">avg expression:</text>
        <rect x={W - 126} y={mt + ph + 52} width={98} height={9} fill="url(#expGrad)" rx={3} />
        <text x={W - 126} y={mt + ph + 72} fontSize={8} fill="#4b5563" fontFamily="Inter, sans-serif">−0.5</text>
        <text x={W - 28} y={mt + ph + 72} textAnchor="end" fontSize={8} fill="#4b5563" fontFamily="Inter, sans-serif">1.0</text>
      </svg>
    </Card>
  );
}

function GeneExpression() {
  const [gene, setGene] = useState('INS');
  const [inputVal, setInputVal] = useState('INS');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  const applyGene = useCallback((g) => {
    setInputVal(g);
    if (DOT_DATA[g]) setGene(g);
    setShowSugg(false);
    setSuggestions([]);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (val.trim()) {
      const q = val.toUpperCase();
      const filtered = GENE_LIST.filter((g) => g.includes(q));
      setSuggestions(filtered);
      setShowSugg(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSugg(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = inputVal.toUpperCase();
      const exact = GENE_LIST.find((g) => g === q) || GENE_LIST.find((g) => g.startsWith(q));
      if (exact) applyGene(exact);
      setShowSugg(false);
    }
    if (e.key === 'Escape') setShowSugg(false);
  };

  const handleSearchBtn = () => {
    const q = inputVal.toUpperCase();
    const match = GENE_LIST.find((g) => g === q) || GENE_LIST.find((g) => g.startsWith(q));
    if (match) applyGene(match);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default'}}>
      <NavBar />

      <Box sx={{ maxWidth: 1600, width: '100%', mx: 'auto', px: { xs: 2 , md: 6 }, pb: 5 }}>
        {/* Page hero */}
        <Box sx={{ pt: 5, pb: 3 , marginX: '12%'}}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'primary.main',
              mb: 1.5,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '0ms',
            }}
          >
            <Box sx={{ width: 24, height: 2, bgcolor: 'primary.main', borderRadius: '2px' }} />
            Expression Analysis
          </Box>
          <Typography
            sx={{
              fontFamily: '"Source Serif 4", serif',
              fontSize: { xs: '1.75rem', md: '2rem' },
              fontWeight: 700,
              color: 'navy.main',
              letterSpacing: '-0.5px',
              mb: 1,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '50ms',
            }}
          >
            Gene Expression
          </Typography>
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: 'text.secondary',
              lineHeight: 1.75,
              maxWidth: 560,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '100ms',
            }}
          >
            Query any of the 1,000 measured genes across all 20 donors, cell types, and disease stages. Compare expression levels and spatial patterns.
          </Typography>
        </Box>

        {/* Divider between hero and content */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 0, mb: 3, px: '5%' }}>
          <Box sx={{ width: '100%', height: '0.5px', bgcolor: 'divider' }} />
        </Box>

        {/* Content: same horizontal band as divider (5% side inset), no extra maxWidth so it matches bar width */}
        <Box sx={{ px: '5%' }}>
          <Box sx={{ width: '100%' }}>
          {/* Search row with autocomplete */}
          <Box sx={{ position: 'relative', mb: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search gene (e.g. INS, HLA-A, CD8A, STAT1)…"
                value={inputVal}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (suggestions.length > 0) setShowSugg(true); }}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.9rem',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchBtn}
                sx={{
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  py: 1.25,
                  px: 2.75,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Search
              </Button>
            </Box>
            {showSugg && suggestions.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 60,
                  mt: 0.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  boxShadow: 2,
                  zIndex: 200,
                  maxHeight: 196,
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((g) => (
                  <Box
                    key={g}
                    component="button"
                    type="button"
                    onMouseDown={() => applyGene(g)}
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      py: 1.125,
                      px: 2,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.85rem',
                      color: 'text.primary',
                      border: 'none',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      '&:last-of-type': { borderBottom: 'none' },
                      '&:hover': { bgcolor: 'primary.light', color: 'primary.main' },
                    }}
                  >
                    {g}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Quick chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 4 }}>
            <Typography component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, mr: 0.5 }}>
              Quick:
            </Typography>
            {QUICK_CHIPS.map((g) => (
              <Box
                key={g}
                component="button"
                type="button"
                onClick={() => applyGene(g)}
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: gene === g ? 'primary.contrastText' : 'primary.main',
                  bgcolor: gene === g ? 'primary.main' : 'primary.light',
                  border: '1px solid',
                  borderColor: gene === g ? 'primary.main' : 'accent.border',
                  py: 0.5,
                  px: 1.25,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                }}
              >
                {g}
              </Box>
            ))}
          </Box>

          {/* Charts row — span full width of content area */}
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'flex-start', width: '100%'}}>
            <UMAPPlot />
            <DotPlot gene={gene} />
          </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default GeneExpression;
