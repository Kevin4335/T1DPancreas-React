import { createTheme, darken } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', 
    },
    secondary: {
      main: '#00c2cb', //  blue
    },
    red: {
      main: '#ff4c4c', //  red 
      contrastText: '#FFFFFF'
    },
    green: {
      main: '#7ecb20', //  green
      contrastText: '#FFFFFF'
    },
    blue: {
      main: '#00c2cb', //  blue
      contrastText: '#FFFFFF'
    },
    yellow: {
      main: '#FFD600', // yellow
      contrastText: '#000000'
    },
    SiteMainColor: {
      main: '#073b4c', 
      contrastText: '#FFFFFF'
    },
    SiteSecondaryColor: {
      main: '#118ab2',
      contrastText: '#FFFFFF',
      hover: '#3db9df',
      active: '#0d6e91' 
    },
    SiteTertiaryColor: {
      main: '#06d6a0',
      contrastText: '#FFFFFF'
    },

    background: {
      default: '#fdf6e3', // soft beige
    },
  },
  typography: {
    fontFamily: '"Hack", monospace',
  },
  components: {
  }
});

export default theme;
