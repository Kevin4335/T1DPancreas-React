import React from 'react';
import { Button, Typography, Container, TextField, Grid, Box, Paper, Card, CardActionArea, CardContent } from '@mui/material';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Home() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatInput, setChatInput] = useState(location.state?.chatInput || '');

  // Pre-made chat prompts
  const prompts = [
    "Show me the gene expression for INS in Beta cells.",
    "What is the cell composition in FOV 101 for a T1D donor?",
    "Compare gene expression of GCG between Control and T1D."
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', marginTop: '1rem', textAlign: 'center'}}>
                Explore the T1D Spatial Atlas!
            </Typography>

            {/* Intro Information */}
            <Grid container spacing={3} width='100%' height='100%' marginTop={'2vw'}>
                <Grid size={6}>
                    <item>
                        <Typography variant="body1" gutterBottom >
                            <b>T1D Spatial Atlas</b> is an interactive, AI-powered platform for analyzing CosMX (NanoString) spatial transcriptomics data from human pancreatic tissues. It features single-cell spatial datasets from 20 donors representing key stages of type 1 diabetes progression: healthy controls, autoantibody-positive individuals without lymphocyte infiltration (AB⁺LN⁻), with infiltration (AB⁺LN⁺), and individuals with clinical T1D. The platform enables in-depth exploration of spatial gene expression and cell-type-specific changes across these distinct disease stages.
                        </Typography>
                    </item>
                </Grid>
                <Grid size={6}>
                    <item>
                        {/* Table for dataset summary */}
                        <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr>
                                    <th style={{ borderBottom: '2px solid #ccc', padding: '8px' }}># Subjects</th>
                                    <th style={{ borderBottom: '2px solid #ccc', padding: '8px' }}># Cells</th>
                                    <th style={{ borderBottom: '2px solid #ccc', padding: '8px' }}># FOVs</th>
                                    <th style={{ borderBottom: '2px solid #ccc', padding: '8px' }}># Genes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px' }}>Control: 5<br/>AB+LN-: 5<br/>AB+LN+: 5<br/>T1D: 5</td>
                                    <td style={{ padding: '8px' }}>1,139,248</td>
                                    <td style={{ padding: '8px' }}>408</td>
                                    <td style={{ padding: '8px' }}>1000</td>
                                </tr>
                            </tbody>
                        </table>
                    </item>
                </Grid>
            </Grid>

            {/* Pre-made prompt cards in a single row */}
            <Grid container spacing={2} justifyContent="center" alignItems="stretch" sx={{ mt: 4, mb: 2 }}>
              {prompts.map((prompt, idx) => (
                <Grid size={4} key={idx} >
                    <item>
                        <Card
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                backgroundColor: theme.palette.SiteSecondaryColor.main,
                                color: '#FFFFFF',
                                borderTop: '1px dotted black',
                                borderRight: '5px solid black',
                                borderBottom: '5px solid black',
                                borderLeft: '1px solid black',
                                boxShadow: 'none',
                                borderRadius: '0'
                            }}
                        >
                            <CardActionArea
                                sx={{ height: '100%' }}
                                onClick={() => navigate('/AIChat', { state: { chatInput: prompt } })}
                            >
                                <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 500 }}>
                                    {prompt}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                  </item>
                </Grid>
              ))}
            </Grid>
            
            {/* Search bar for AI */}
            <Grid container spacing={3} width='100%' height='100%'>
                <Grid size={12}>
                    <item>
                        <Box display="flex" alignItems="center" justifyContent="center" mt={4}>
                          <TextField
                            variant="outlined"
                            placeholder="Ask AI anything..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            fullWidth
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                if (chatInput.trim()) {
                                  navigate('/AIChat', { state: { chatInput } });
                                }
                              }
                            }}
                          />
                          <Button
                            variant="contained"
                            color="SiteSecondaryColor"
                            sx={{ ml: 2, height: '56px' }}
                            onClick={() => {
                              if (chatInput.trim()) {
                                navigate('/AIChat', { state: { chatInput } });
                              }
                            }}
                          >
                            Send
                          </Button>
                        </Box>
                    </item>
                </Grid>
            </Grid>
        </Container>
        <Footer />
    </div>
  )
}

export default Home;
