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
      main: '#1A3C64', 
      contrastText: '#FFFFFF'
    },
    SiteSecondaryColor: {
      main: '#156082',
      contrastText: '#FFFFFF'
    },
    SiteTertiaryColor: {
      main: '#1E90FF',
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
    MuiButton:{
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          const bgColor =
            theme.palette[ownerState.color || 'primary']?.main || theme.palette.primary.main;

          return {
            backgroundColor: bgColor,
            borderTop: '1px dotted black',
            borderRight: '5px solid black',
            borderBottom: '5px solid black',
            borderLeft: '1px solid black',
            boxShadow: 'none',
            borderRadius:'0',
            '&:hover': {
              backgroundColor: darken(bgColor, 0.4),
              boxShadow: 'none',
            },
            '&:active': {
              backgroundColor: darken(bgColor, 0.6),
              borderTop: '3px solid black',
              borderLeft: '3px solid black',
              borderRight: '3px solid black',
              borderBottom: '3px solid black',
              boxShadow: 'none',
            },
          };
        },
      },

      defaultProps: {
        disableRipple: true,
      },
    },

    MuiTextField:{
      styleOverrides:{
        root:{
          '& .MuiOutlinedInput-root': {
            borderRadius: '0',
            backgroundColor: 'white',
            '& fieldset': {
              borderRadius: '0',
              borderTop: '1px solid black',
              borderRight: '5px solid black',
              borderBottom: '5px solid black',
              borderLeft: '1px solid black',
            },
            '&:hover fieldset': {
              borderRadius: '0',
              borderTop: '1px solid black',
              borderRight: '5px solid black',
              borderBottom: '5px solid black',
              borderLeft: '1px solid black',
            },
            '&.Mui-focused fieldset': {
              borderRadius: '0',
              borderTop: '1px solid black',
              borderRight: '5px solid black',
              borderBottom: '5px solid black',
              borderLeft: '1px solid black',
            },
          },
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '0',
        },
        outlined: {
          borderRadius: '0',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0',
        },
        notchedOutline: {
          borderRadius: '0',
        }
      }
    }
  }
});

export default theme;
