import React, { useState } from 'react';
import { 
    Button, 
    Typography, 
    Container, 
    TextField, 
    Grid, 
    Box, 
    Paper, 
    FormControlLabel,
    Checkbox,
    FormGroup,
    Alert,
    LinearProgress,
    Chip
} from '@mui/material';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { useTheme } from '@mui/material/styles';

function GeneExpression() {
    const theme = useTheme();
    
    // State management
    const [geneInput, setGeneInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [imageData, setImageData] = useState('');
    const [validGenes, setValidGenes] = useState([]);
    const [invalidGenes, setInvalidGenes] = useState([]);
    
    // Cell types (same as GeneExpOLD.js)
    const cellTypes = [
        "Acinar", "Alpha", "Beta", "Delta", "Ductal", "Endothelial", "Mesenchymal",
        "B cells",  "Dendritic cells", "Macrophages", "Monocytes", "Granulocytes", 
        "NK cells", "Pre-B cells", "T cells",  "Unknown"
    ];

    // Cell type selection state
    const [selectedCellTypes, setSelectedCellTypes] = useState(
        cellTypes.reduce((acc, cellType) => {
            acc[cellType] = false;
            return acc;
        }, {})
    );
    
    // Configuration
    const GLB_API_SERVER_URL = 'http://128.84.40.121:5000'; // Update this to match your backend URL
    const GLB_SINGLE_GENE_TIME = 90;
    const GLB_MULTI_GENE_TIME = 35;
    
    // Helper function to replace characters (same as GeneExpOLD.js)
    const replaceAll = (string, a, b) => {
        return string.split(a).join(b);
    };
    
    // Helper function to convert string to hex (same as GeneExpOLD.js)
    const stringToHex = (str) => {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let hex = '';
        for (let byte of bytes) {
            hex += byte.toString(16).padStart(2, '0');
        }
        return hex;
    };
    
    // Parse and validate genes
    const parseGenes = (input) => {
        if (!input.trim()) return { valid: [], invalid: [] };
        
        let text = input.toUpperCase();
        text = replaceAll(text, ' ', '');
        text = replaceAll(text, '\n', ',');
        
        const genes = text.split(',').filter(gene => gene.trim() !== '');
        
        // For now, we'll accept all genes since we're not hardcoding
        // In a real implementation, you'd validate against a gene list from your backend
        return {
            valid: genes,
            invalid: []
        };
    };
    
    // Handle gene input change
    const handleGeneInputChange = (event) => {
        const input = event.target.value;
        setGeneInput(input);
        
        const { valid, invalid } = parseGenes(input);
        setValidGenes(valid);
        setInvalidGenes(invalid);
    };
    
    // Handle cell type selection
    const handleCellTypeChange = (cellType) => (event) => {
        setSelectedCellTypes(prev => ({
            ...prev,
            [cellType]: event.target.checked
        }));
    };
    
    const simulateProgress = () => {
        let progressValue = 0;

        const increment = () => {
            // Increase gradually to 80%
            if (progressValue < 80) {
                progressValue += 0.2; // Adjust speed here
                setProgress(progressValue);
                setTimeout(increment, 50); // Frame every 50ms = 4s to 80%
            }
        };

        increment();
    };
    
    // Handle submit
    const handleSubmit = async () => {
        // Validation
        if (validGenes.length === 0) {
            setErrorMessage('Please enter at least one valid gene.');
            return;
        }
        
        const checkedCellTypes = Object.entries(selectedCellTypes)
            .filter(([_, checked]) => checked)
            .map(([cellType]) => cellType);

        if (checkedCellTypes.length === 0) {
            setErrorMessage('Please select at least one cell type.');
            return;
        }
        
        setIsLoading(true);
        setErrorMessage('');
        setImageData('');
        setProgress(0);
        
        // Start progress simulation
        simulateProgress();
        
        try {
            // Prepare request data (same format as GeneExpOLD.js)
            const requestData = {
                f: 2,
                p1: validGenes.join(','),
                p2: checkedCellTypes.join(',')
            };
            
            const jsonData = JSON.stringify(requestData);
            const hexData = stringToHex(jsonData);
            const url = `${GLB_API_SERVER_URL}/gene_exp/${hexData}`;

            console.log('JSON Data:', jsonData);
            console.log('Hex Data:', hexData);

            console.log('Submitting gene expression request:', requestData);
            console.log('Request URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                timeout: 950000
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.img) {
                    setImageData(`data:image/png;base64,${data.img}`);
                    setProgress(100);
                } else {
                    setErrorMessage('No image data received from server.');
                }
            } else if (response.status === 500) {
                const errorData = await response.json();
                setErrorMessage(`Server error: ${errorData.msg || 'Unknown error'}`);
            } else {
                setErrorMessage(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Request error:', error);
            if (error.name === 'AbortError') {
                setErrorMessage('Request timeout. Please try again.');
            } else {
                setErrorMessage(`Network error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };
    
    // Check if submit button should be active
    const isSubmitActive = () => {
        return validGenes.length > 0 && 
               Object.values(selectedCellTypes).some(checked => checked) && 
               !isLoading;
    };
    
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container mb='2vw' sx={{ flex: 1, mb: 2  }}>
                <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    marginTop: '1rem', 
                    textAlign: 'center',
                    color: theme.palette.primary.main
                }}>
                    Gene Expression Analysis
                </Typography>
                
                <Typography variant="body1" sx={{ 
                    textAlign: 'center', 
                    mb: 4, 
                    color: 'text.secondary',
                    maxWidth: 600,
                    mx: 'auto'
                }}>
                    Enter gene names separated by commas to generate expression analysis plots.
                    Select the cell types you want to include in the analysis.
                </Typography>
                
                {/* Form Container */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Left side - Input Form */}
                    <Grid size={4}>
                        <item>
                            <Paper elevation={3} sx={{ 
                                p: 3, 
                                borderRadius: '1rem',
                                height: 'fit-content'
                            }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                                    Analysis Parameters
                                </Typography>
                                
                                {/* Gene Input */}
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Enter Gene Names"
                                        value={geneInput}
                                        onChange={handleGeneInputChange}
                                        placeholder="e.g., INS, GCG, SST, PPY"
                                        helperText="Enter gene names separated by commas"
                                        variant="outlined"
                                        disabled={isLoading}
                                    />
                                    
                                    {/* Gene validation display */}
                                    {validGenes.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="success.main">
                                                Valid genes: {validGenes.length}
                                            </Typography>
                                            <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {validGenes.slice(0, 5).map((gene, index) => (
                                                    <Chip 
                                                        key={index} 
                                                        label={gene} 
                                                        size="small" 
                                                        color="success" 
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {validGenes.length > 5 && (
                                                    <Chip 
                                                        label={`+${validGenes.length - 5} more`} 
                                                        size="small" 
                                                        color="primary" 
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    {invalidGenes.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="error">
                                                Invalid genes: {invalidGenes.join(', ')}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                
                                {/* Cell Types Selection */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Cell Types to Include:
                                    </Typography>
                                    <FormGroup>
                                        <Grid container spacing={1}>
                                            {cellTypes.map((cellType, index) => (
                                                <Grid item xs={6} key={index}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={selectedCellTypes[cellType]}
                                                                onChange={handleCellTypeChange(cellType)}
                                                                disabled={isLoading}
                                                                size="small"
                                                            />
                                                        }
                                                        label={cellType}
                                                        sx={{ fontSize: '0.875rem' }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </FormGroup>
                                </Box>
                                
                                {/* Submit Button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSubmit}
                                    disabled={!isSubmitActive()}
                                    sx={{ 
                                        height: 50,
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                    color='SiteSecondaryColor'
                                >
                                    {isLoading ? 'Generating Plot...' : 'Generate Expression Plot'}
                                </Button>
                                
                                {/* Progress Bar */}
                                {isLoading && (
                                    <Box sx={{ mt: 2 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={progress} 
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                                            {Math.round(progress)}% Complete
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </item>
                    </Grid>
                    
                    {/*Results Display */}
                    <Grid size={8}>
                        <item>
                            <Paper elevation={3} sx={{ 
                                borderRadius: '1rem',
                                minHeight: 500
                            }}>
                                {/* Error Display */}
                                {errorMessage && (
                                    <Alert severity="error" sx={{ m: 2 }}>
                                        {errorMessage}
                                    </Alert>
                                )}
                                
                                {/* Loading State */}
                                {isLoading && !errorMessage && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: 400,
                                        p: 3
                                    }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Generating Expression Plot...
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            This may take a few minutes depending on the number of genes selected.
                                        </Typography>
                                    </Box>
                                )}
                                
                                {/* Image Display */}
                                {imageData && !isLoading && (
                                    <Box
                                        component="img"
                                        src={imageData}
                                        alt="Gene Expression Plot"
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '70vh',
                                            objectFit: 'contain',
                                            display: 'block',
                                            margin: 'auto',
                                            padding: 2,
                                        }}
                                    />
                                )}
                                
                                {/* Empty State */}
                                {!imageData && !isLoading && !errorMessage && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: 400,
                                        p: 3
                                    }} >
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                            <b>Ready to Explore</b>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            Enter gene names and select cell types, then click "Generate Expression Plot" to view the results.
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </item>
                    </Grid>
                </Grid>
            </Container>
            <Footer />
        </div>
    );
}

export default GeneExpression;