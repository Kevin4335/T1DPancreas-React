import React from 'react';
import { Button, Typography, Container, TextField, Grid, Box, Paper } from '@mui/material';
import Navbar from './components/NavBar';
import { useTheme } from '@mui/material/styles';
import Footer from './components/Footer';


function Help() {
    const theme = useTheme();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', marginTop: '1rem', textAlign: 'center'}}>
                    Help
                </Typography>
    
                <Grid container spacing={3} width='100%' height='100%'>
                    <Grid size={4}>
                        <item>
                            <TextField id="email-submit" label="Email" variant="outlined" fullWidth />
                            <Button variant="contained" color="red" fullWidth>
                                Click Me
                            </Button>
                            <Button variant="contained" color="green" fullWidth>
                                Click Me
                            </Button>
                            <Button variant="contained" color="blue" fullWidth>
                                Click Me
                            </Button>
                        </item>
                    </Grid>
                    <Grid size={8}>
                        <item>
                            
                            <Paper elevation={3}>
                                <Box
                                    component="img"
                                    src="/images/my-graph.png" // Place your image in the public/images folder
                                    alt="Generated Graph Test"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 800,
                                        aspectRatio: '1 / 1',
                                        objectFit: 'contain',
                                        display: 'block',
                                        margin: 'auto',
                                        padding: 2,
                                        border: '2px solid black',
                                        borderRight: '6px solid black',
                                        borderBottom: '6px solid black',
                                    }}
                                />
                            </Paper>
    
                        </item>
                    </Grid>
                    
    
                </Grid>
            </Container>
        <Footer />                        
      </div>
    )
}

export default Help;