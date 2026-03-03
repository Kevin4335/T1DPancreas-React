import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function Footer() {
  const footerLinks = [
    { to: '/Help', label: 'Documentation' },
    { to: '#', label: 'Data Access' },
    { to: '#', label: 'Contact' },
    { to: '#', label: 'Privacy' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 3,
        px: { xs: 2, md: 7 },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Typography
          component="span"
          sx={{
            fontFamily: '"Source Serif 4", serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'navy.main',
          }}
        >
          T1D Spatial Atlas
        </Typography>
        <Typography component="span" sx={{ color: 'border.light', fontSize: '0.9rem' }}>
          ·
        </Typography>
        <Typography component="span" sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
          Spatial Transcriptomics Platform · v1.0
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2.5 }}>
        {footerLinks.map(({ to, label }) => (
          <Box
            key={label}
            component={Link}
            to={to}
            sx={{
              fontSize: '0.78rem',
              color: 'text.secondary',
              textDecoration: 'none',
              transition: 'color 0.15s',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Footer;
