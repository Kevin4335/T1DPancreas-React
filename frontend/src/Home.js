import React from 'react';
import { Button, Typography, Container, TextField, Grid, Box, Card, CardActionArea, CardContent } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', marginTop: '2rem', textAlign: 'center'}}>
                Explore the T1D Spatial Atlas!
            </Typography>

            {/* Intro Information */}
            <Grid container spacing={3} width='100%' height='100%' marginTop={'2vw'}>
                <Grid size={6}>
                    <item>
                      <Typography variant="body1" gutterBottom>
                        <b>T1D Spatial Atlas</b> is an interactive, AI-powered platform for analyzing CosMX (NanoString) spatial transcriptomics data from human pancreatic tissues.
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        It features single-cell spatial datasets from 19 donors, representing key stages of type 1 diabetes progression: healthy controls, autoantibody-positive individuals without lymphocyte infiltration (AAB⁺LP⁻), those with infiltration (AAB⁺LP⁺), and individuals with clinical T1D.
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        This platform enables detailed exploration of spatial gene expression patterns and cell-type–specific changes across these distinct disease stages, providing a powerful resource for uncovering mechanisms of T1D pathogenesis.
                      </Typography>
                    </item>
                </Grid>
                <Grid size={6}>
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid size={6}>
                      <item>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: '1rem',
                            textAlign: 'center',
                            height: '100%',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Subjects
                          </Typography>
                          
                          <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>
                            Control, AB⁺LN⁻, AB⁺LN⁺, T1D
                          </Typography>
                        </Card>
                      </item>
                    </Grid>

                    <Grid size={6}>
                      <item>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: '1rem',
                            textAlign: 'center',
                            height: '100%',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Total Cells
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            1,139,248
                          </Typography>
                        </Card>
                      </item>
                    </Grid>

                    <Grid size={6}>
                      <item>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: '1rem',
                            textAlign: 'center',
                            height: '100%',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            FOVs
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            408
                          </Typography>
                        </Card>
                      </item>
                    </Grid>

                    <Grid size={6}>
                      <item>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: '1rem',
                            textAlign: 'center',
                            height: '100%',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Genes
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            1000
                          </Typography>
                        </Card>
                      </item>
                    </Grid>
                  </Grid>
                </Grid>
            </Grid>

            {/* Pre-made prompt cards in a single row */}
            <Grid container spacing={2} justifyContent="center" alignItems="stretch" sx={{ mt: 3, mb: 2 }}>
              {prompts.map((prompt, idx) => (
                <Grid size={4} key={idx}>
                  <item>
                    <Card
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderRadius: '0.75rem',
                        backgroundColor: theme.palette.SiteSecondaryColor.main,
                        color: theme.palette.SiteSecondaryColor.contrastText,
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                          backgroundColor: theme.palette.SiteSecondaryColor.hover,
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                          backgroundColor: theme.palette.SiteSecondaryColor.active,
                        },
                      }}
                      variant="outlined"
                    >
                      <CardActionArea
                        sx={{ height: '100%' }}
                        onClick={() => navigate('/AIChat', { state: { chatInput: prompt } })}
                      >
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 3,
                          }}
                        >
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
                      <Box display="flex" justifyContent="center" mt={3}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            backgroundColor: '#fff',
                            border: '1px solid #118ab2',
                            borderRadius: '10rem 10rem 10rem 10rem'
                          }}
                        >
                          <TextField
                            variant="outlined"
                            placeholder="Ask AI anything..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            fullWidth
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && chatInput.trim()) {
                                navigate('/AIChat', { state: { chatInput } });
                              }
                            }}
                            sx={{
                              ml: 1.5,
                              height:'100%',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '999px',
                                backgroundColor: '#fff',
                                //transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                '& fieldset': {
                                  borderColor: '#fff',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#fff',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#fff',
                                  //boxShadow: `0 0 0 2px ${theme.palette.SiteSecondaryColor.main}33`,
                                },
                              },
                            }}
                          />

                          <Button
                            variant="contained"
                            color="SiteSecondaryColor"
                            onClick={() => {
                              if (chatInput.trim()) {
                                navigate('/AIChat', { state: { chatInput } });
                              }
                            }}
                            sx={{
                              ml: 1.5,
                              mr: 1.5,
                              height: '75%',
                              borderRadius: 28,
                              transition: 'all 0.05s ease',
                              boxShadow: '0 1px 6px rgba(0, 0, 0, 0.08)',
                              '&:hover': {
                                backgroundColor: theme.palette.SiteSecondaryColor.hover,
                                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                                transform: 'scale(1.02)',
                              },
                              '&:active': {
                                transform: 'scale(0.99)',
                              },
                            }}
                          >
                            <SendIcon />
                          </Button>
                        </Box>
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
