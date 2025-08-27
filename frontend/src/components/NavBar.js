// Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const linkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  marginLeft: '3rem', 
  fontWeight: 'bold',
  paddingBottom: '4px',
};


const activeStyle = {
  borderBottom: '4px solid white',
};

function Navbar() {
  const theme = useTheme();
  return (
    <AppBar position="static" color="SiteMainColor" elevation={4} sx={{ borderBottom: '3px solid black', boxShadow: 'none'}}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Website name */}
        <Typography
          variant="h6"
          component="div"
          fontWeight="bold"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/t1d_logo.png`}
            alt="T1D Logo"
            style={{
              height: "5rem",
              width: "auto",
            }}
          />
          T1D <span style={{ color: theme.palette.yellow.main }}>Spatial</span> Atlas
        </Typography>


        {/* Right: Navigation links */}
        <Box>
          
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/AIChat"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            Chat With AI
          </NavLink>
          <NavLink
            to="/FOV"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            FOV Viewer
          </NavLink>
          <NavLink
            to="/GeneExpression"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            Gene Expression
          </NavLink>
          <NavLink
            to="/Help"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            Help
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeStyle : {}),
            })}
          >
            About
          </NavLink>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
