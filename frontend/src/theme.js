import { createTheme } from '@mui/material/styles';

/**
 * Theme aligned with the T1D Spatial Atlas landing design:
 * light surface, navy text, blue accent, stage colors (green/amber/orange/red).
 * Typography: Source Serif 4 (headings), Inter (body), JetBrains Mono (labels).
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f7f8fc',
      paper: '#ffffff',
    },
    primary: {
      main: '#2563eb',   // accent blue
      light: '#eff4ff',
      dark: '#1d4fd8',
    },
    secondary: {
      main: '#1a2a4a',   // navy
      light: '#2d3f63',
    },
    navy: {
      main: '#1a2a4a',
      light: '#2d3f63',
    },
    text: {
      primary: '#1e2d45',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    border: {
      main: '#e2e7f0',
      light: '#cdd4e4',
    },
    accent: {
      main: '#2563eb',
      light: '#eff4ff',
      border: '#bfcffe',
    },
    // Disease stage colors
    stage: {
      control: { main: '#059669', light: '#ecfdf5' },
      ab1:    { main: '#d97706', light: '#fffbeb' },
      ab2:    { main: '#ea580c', light: '#fff7ed' },
      t1d:    { main: '#dc2626', light: '#fef2f2' },
    },
    // Legacy names for compatibility
    SiteMainColor: {
      main: '#1a2a4a',
      contrastText: '#ffffff',
    },
    SiteSecondaryColor: {
      main: '#2563eb',
      contrastText: '#ffffff',
      hover: '#1d4fd8',
      active: '#1d4fd8',
    },
    yellow: {
      main: '#FFD600',
      contrastText: '#000000',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Source Serif 4", "Georgia", serif',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      color: '#1a2a4a',
    },
    h2: {
      fontFamily: '"Source Serif 4", "Georgia", serif',
      fontWeight: 700,
      letterSpacing: '-0.3px',
      color: '#1a2a4a',
    },
    h3: {
      fontFamily: '"Source Serif 4", "Georgia", serif',
      fontWeight: 700,
      color: '#1a2a4a',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#64748b',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 7,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
  },
});

export default theme;
