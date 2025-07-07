import React from 'react';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { Button, Typography, Container } from '@mui/material';

function About() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container sx={{ flex: 1 }}>
            <h1>About Page</h1>
        </Container>
        <Footer />
    </div>

  );
}

export default About;
