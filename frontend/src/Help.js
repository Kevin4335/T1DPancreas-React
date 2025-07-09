import React from 'react';
import { Typography, Container, Box, Paper } from '@mui/material';
import Navbar from './components/NavBar';
import { useTheme } from '@mui/material/styles';
import Footer from './components/Footer';

function Help() {
    const theme = useTheme();
    
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    marginTop: '1rem', 
                    textAlign: 'center',
                    color: theme.palette.primary.main
                }}>
                    Tutorials
                </Typography>


                {/* Introduction Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
                        Introduction
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        This website contains four main pages:
                    </Typography>
                    <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            <strong>Expression:</strong> View gene expression data for single or multiple genes
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            <strong>FOV:</strong> Explore spatial transcriptomics data by field of view
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            <strong>Enrichment:</strong> Perform pathway enrichment analysis
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            <strong>AI Chat:</strong> Get help and answers using our AI assistant
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                        Navigate between pages using the navigation bar at the top of the screen.
                    </Typography>
                </Box>

                {/* Expression Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
                        Expression Page Tutorial
                    </Typography>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Single Gene Expression
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        To view expression data for a single gene:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Navigate to the Expression page
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Enter a gene name in the text input field
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select the cell types you want to include in the analysis
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Click "Submit" to generate the expression plot
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <img 
                            src="/imgs/exp1.png" 
                            alt="Single Gene Expression" 
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Multiple Gene Expression
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        To compare expression across multiple genes:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Enter multiple gene names separated by commas
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select cell types for analysis
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Click "Submit" to generate the comparison plot
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <img 
                            src="/imgs/exp2.png" 
                            alt="Multiple Gene Expression" 
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                    </Box>
                </Box>

                {/* FOV Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
                        FOV Page Tutorial
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        The FOV (Field of View) page allows you to explore spatial transcriptomics data:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select the experimental condition
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Choose a donor from the available options
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select a specific field of view (FOV 1-105)
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Choose gene display options (None, Single Gene, or Multi Gene)
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Click "Submit" to view the spatial data
                        </Typography>
                    </Box>
                </Box>

                {/* Enrichment Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
                        Enrichment Page Tutorial
                    </Typography>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Beta Cell Pathways
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        To analyze beta cell pathways:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Navigate to the Enrichment page
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select "Beta Cell Pathways" from the analysis type dropdown
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Choose your parameters and click "Submit"
                        </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Cell Death Pathways
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        To analyze cell death pathways:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select "Cell Death Pathways" from the analysis type dropdown
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Configure your analysis parameters
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Click "Submit" to run the analysis
                        </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Specific Pathways
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        To analyze specific pathways:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select "Specific Pathways" from the analysis type dropdown
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Enter the pathway names you want to analyze
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Configure additional parameters as needed
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Click "Submit" to perform the analysis
                        </Typography>
                    </Box>
                </Box>

                {/* Advanced Enrichment Analysis */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
                        Advanced Enrichment Analysis
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        For custom pathway analysis:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Select "Custom Pathways" from the analysis type dropdown
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Enter your custom pathway definitions
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Specify analysis parameters and thresholds
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Click "Submit" to run the custom analysis
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                        Results will be displayed as interactive plots and downloadable data files.
                    </Typography>
                </Box>

                {/* AI Chat Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>
                        AI Chat Tutorial
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                        The AI Chat feature provides intelligent assistance for your research:
                    </Typography>
                    <Box component="ol" sx={{ pl: 4, mb: 3 }}>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Navigate to the AI Chat page
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            Type your question or request in the chat input
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            The AI will respond with helpful information and visualizations
                        </Typography>
                        <Typography component="li" sx={{ mb: 1 }}>
                            You can ask about data interpretation, analysis methods, or general questions
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                        The AI assistant can help with data interpretation, suggest analysis approaches, and provide educational content about spatial transcriptomics.
                    </Typography>
                </Box>

            </Container>
            <Footer />
        </div>
    );
}

export default Help;