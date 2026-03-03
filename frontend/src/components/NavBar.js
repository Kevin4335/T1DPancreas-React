import React from 'react';
import { Box, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';

const LogoMark = () => (
  <Box
    sx={{
      width: 36,
      height: 36,
      bgcolor: 'navy.main',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    </svg>
  </Box>
);

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/AIChat', label: 'Chat with AI' },
  { to: '/FOV', label: 'Image' },
  { to: '/FOV', label: 'FOV Viewer' },
  { to: '/GeneExpression', label: 'Gene Expression' },
];

function NavBar() {
  const location = useLocation();

  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, md: 7 },
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <NavLink to="/" style={{ textDecoration: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LogoMark />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Source Serif 4", serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'navy.main',
                letterSpacing: '-0.2px',
                display: 'block',
              }}
            >
              T1D Spatial Atlas
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.68rem',
                color: 'text.disabled',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Spatial Transcriptomics · Human Pancreas
            </Typography>
          </Box>
        </Box>
      </NavLink>

      <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {navItems.map(({ to, label }) => {
          const isActive = location.pathname === to || (to === '/' && location.pathname === '/');
          return (
            <NavLink key={to + label} to={to} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  px: 1.75,
                  py: 0.875,
                  borderRadius: 1,
                  transition: 'all 0.15s',
                  '&:hover': {
                    color: isActive ? 'primary.main' : 'text.primary',
                    bgcolor: isActive ? 'primary.light' : 'action.hover',
                  },
                }}
              >
                {label}
              </Box>
            </NavLink>
          );
        })}
        <Box sx={{ width: '1px', height: 18, bgcolor: 'divider', mx: 0.75, flexShrink: 0 }} />
        <NavLink to="/Help" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              color: location.pathname === '/Help' ? 'primary.main' : 'text.secondary',
              bgcolor: location.pathname === '/Help' ? 'primary.light' : 'transparent',
              fontWeight: location.pathname === '/Help' ? 600 : 500,
              fontSize: '0.85rem',
              px: 1.75,
              py: 0.875,
              borderRadius: 1,
              transition: 'all 0.15s',
              '&:hover': {
                color: location.pathname === '/Help' ? 'primary.main' : 'text.primary',
                bgcolor: location.pathname === '/Help' ? 'primary.light' : 'action.hover',
              },
            }}
          >
            Help
          </Box>
        </NavLink>
        <NavLink to="/about" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              bgcolor: 'navy.main',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2,
              py: 0.875,
              borderRadius: 1,
              transition: 'all 0.15s',
              '&:hover': { bgcolor: 'secondary.light' },
            }}
          >
            About
          </Box>
        </NavLink>
      </Box>
    </Box>
  );
}

export default NavBar;
