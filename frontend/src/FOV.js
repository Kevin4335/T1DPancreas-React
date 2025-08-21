import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, TextField, Grid, Box, Paper, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { useTheme } from '@mui/material/styles';


function FOV() {
    
    const stringToHex = (str) => {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let hex = '';
        for (let byte of bytes) {
            hex += byte.toString(16).padStart(2, '0');
        }
        return hex;
    };
    
    const theme = useTheme();
    
    // State for form fields
    const [condition, setCondition] = useState('');
    const [donor, setDonor] = useState('');
    const [fov, setFov] = useState('');
    const [geneDisplay, setGeneDisplay] = useState('');
    const [singleGene, setSingleGene] = useState('');
    const [multiGeneInput, setMultiGeneInput] = useState('');
    const [email, setEmail] = useState('');
    
    // State for image display
    const [imageUrl, setImageUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [singleGeneOptions, setSingleGeneOptions] = useState([]);
    
    useEffect(() => {
        fetch('http://128.84.40.121:5000/genes')
            .then(response => response.json())
            .then(data => {
                setSingleGeneOptions(data);
                console.log("Loaded genes:", data);
            })
            .catch(error => {
                console.error("Error fetching genes:", error);
            });
    }, []);
    // Configuration
    const GLB_DATA_SERVER_URL = ''; // Update this to match your backend URL
    
    const conditionOptions = ['Control', 'AB+LN-', 'AB+LN+', 'T1D'];
    const donorOptionsByCondition = {
        'Control': ['HPAP-122', 'HPAP-129', 'HPAP-131', 'HPAP-140'],
        'AB+LN-': ['HPAP-024', 'HPAP-045', 'HPAP-072', 'HPAP-092', 'HPAP-148'],
        'AB+LN+': ['HPAP-008', 'HPAP-016', 'HPAP-029', 'HPAP-038', 'HPAP-107'],
        'T1D': ['HPAP-078', 'HPAP-084', 'HPAP-089', 'HPAP-123', 'HPAP-149']
    };

    const fovOptionsByDonor = {
        "HPAP-008": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,94,95],
        "HPAP-016": [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93],
        "HPAP-024": [29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49],
        "HPAP-029": [49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,100],
        "HPAP-038": [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],
        "HPAP-045": [100,101,102,103],
        "HPAP-072": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28],
        "HPAP-078": [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97],
        "HPAP-084": [34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
        "HPAP-089": [26,27,28,29,30,31,32,33,98,99,100],
        "HPAP-092": [50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74],
        "HPAP-107": [67,68,69,70,71,72,73,74,75,96,97,98,99],
        "HPAP-122": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
        "HPAP-123": [51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75],
        "HPAP-129": [66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105],
        "HPAP-131": [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],
        "HPAP-140": [41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65],
        "HPAP-148": [75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99],
        "HPAP-149": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
    };
    const geneDisplayOptions = ['None', 'Single Gene', 'Multi Gene (Max 3)'];
    
    // Helper function to replace characters in gene names (same as fovOLD.js)
    const replaceAll = (string, a, b) => {
        return string.split(a).join(b);
    };
    
    // Email validation function
    const isValidEmail = (email) => {
        return /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]+$/.test(email);
    };
    
    // Check if submit button should be active
    const isSubmitActive = () => {
        // All 4 required fields must be filled
        if (!condition || !donor || !fov || !geneDisplay) {
            return false;
        }
        
        // If GeneDisplay is "None", submit is active
        if (geneDisplay === 'None') {
            return true;
        }
        
        // If GeneDisplay is "Single Gene", singleGene must be selected
        if (geneDisplay === 'Single Gene') {
            return !!singleGene;
        }
        
        // If GeneDisplay is "Multi Gene", multiGeneInput must have content and email must be valid
        if (geneDisplay === 'Multi Gene (Max 3)') {
            return !!multiGeneInput.trim() && isValidEmail(email);
        }
        
        return false;
    };
    
    // Handle submit
    const handleSubmit = async () => {
        if (!isSubmitActive()) return;
        
        setIsLoading(true);
        setErrorMessage('');
        
        // Validate required fields
        let errMsg = '';
        if (condition === "") {
            errMsg += 'Please select condition, donor, and FOV. ';
        } else if (donor === "") {
            errMsg += 'Please select donor and FOV. ';
        } else if (fov === "") {
            errMsg += 'Please select FOV. ';
        }
        
        if (geneDisplay.startsWith('Single') && !singleGene) {
            errMsg += 'Please select a gene. ';
        }
        
        // Validate email for multi-gene requests
        if (geneDisplay === 'Multi Gene (Max 3)') {
            if (!email) {
                errMsg += 'Please enter an email address. ';
            } else if (!isValidEmail(email)) {
                errMsg += 'Please enter a valid email address. ';
            }
        }
        
        if (errMsg !== '') {
            setImageUrl('');
            setErrorMessage(errMsg);
            setIsLoading(false);
            return;
        }
        
        // Handle multi-gene email submission
        if (geneDisplay === 'Multi Gene (Max 3)') {
            // Parse genes from input
            const genes = multiGeneInput.split(',').map(gene => gene.trim()).filter(gene => gene);
            
            if (genes.length < 2) {
                setErrorMessage('Please enter at least 2 genes.');
                setIsLoading(false);
                return;
            }
            
            if (genes.length > 3) {
                setErrorMessage('Please enter no more than 3 genes.');
                setIsLoading(false);
                return;
            }
        }
        
        // Construct image URL based on fovOLD.js format
        let link = '';

        // If geneDisplay is 'None', use the spatial_plots path with underscore and _Image.png suffix
        if (geneDisplay === 'None') {
            link = `/spatial_plots/all_cells/${donor}/${donor}_${fov}_Image.png`;
            setImageUrl(link);
            setIsLoading(false);
            console.log('Using pre-generated image:', link);
        } else if (geneDisplay === 'Single Gene') {
            const folderMap = {
                'Control': 'CTRL',
                'AB+LN-': 'ABposLNminus',
                'AB+LN+': 'ABposLNpos',
                'T1D': 'T1D'
            };

            const filenameMap = {
                'Control': 'Control',
                'AB+LN-': 'AB_plus_LN_minus',
                'AB+LN+': 'AB_plus_LN_plus',
                'T1D': 'T1D'
            };

            const outerFolder = folderMap[condition] || condition;
            const filenameCondition = filenameMap[condition] || condition;

            let gene = replaceAll(singleGene, '/', '.');
            gene = replaceAll(gene, ' ', '@');

            link = `/spatial_plots/single_gene/${outerFolder}/${donor}/${filenameCondition}_${donor}_${fov}_${gene}.png`;
            setImageUrl(link);
            setIsLoading(false);
            console.log('Using pre-generated single gene image:', link);
        } else if (geneDisplay === 'Multi Gene (Max 3)') {
            try {
                const validGenes = multiGeneInput.split(',').map(g => g.trim()).filter(Boolean);
                const filenameMap = {
                    'Control': 'Control',
                    'AB+LN-': 'AB_plus_LN_minus',
                    'AB+LN+': 'AB_plus_LN_plus',
                    'T1D': 'T1D'
                };
                const requestData = {
                    f: 1,
                    p1: filenameMap[condition],
                    p2: donor,
                    p3: fov,
                    p4: validGenes.join(',')
                };

                const jsonData = JSON.stringify(requestData);
                const hexData = stringToHex(jsonData);
                const url = `http://128.84.40.121:5000/fov/${hexData}`;

                console.log('JSON Data:', jsonData);
                console.log('Hex Data:', hexData);

                console.log('Submitting fov request:', requestData);
                console.log('Request URL:', url);

                const response = await fetch(url, { method: 'GET' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.img) {
                        const imageUrl = `data:image/png;base64,${data.img}`;
                        setImageUrl(imageUrl);

                        // Send simple email
                        const response = await fetch('http://128.84.40.121:9035/api/email_simple', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email,
                                image_data: imageUrl,
                                donor,
                                condition
                            })
                            });
                    } else {
                        setErrorMessage('No image data received from server.');
                    }
                } else {
                    const err = await response.json();
                    setErrorMessage(`HTTP ${response.status}: ${err?.error || err?.msg || response.statusText}`);
                }
            } catch (error) {
                console.error('FOV request error:', error);
                if (error.name === 'AbortError') {
                    setErrorMessage('Request timeout. Please try again.');
                } else {
                    setErrorMessage(`Network error: ${error.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            setErrorMessage('Unknown geneDisplay mode');
            setIsLoading(false);
        }

    };
    
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container sx={{ flex: 1, mb: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    marginTop: '1rem', 
                    textAlign: 'center',
                    color: theme.palette.primary.main
                }}>
                    FOV Viewer
                </Typography>
                
                <Typography variant="body1" sx={{ 
                    textAlign: 'center', 
                    mb: 4, 
                    color: 'text.secondary',
                    maxWidth: 600,
                    mx: 'auto'
                }}>
                    Explore spatial transcriptomics data by selecting condition, donor, and field of view (FOV). 
                    Choose gene display options to visualize.
                </Typography>
                
                {/* Form Container */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Left side - Form */}
                    <Grid size={4}>
                        <item>
                            <Paper elevation={3} sx={{ p: 3, borderRadius: '1rem' }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                                    FOV Parameters
                                </Typography>
                                
                                {/* Required Dropdowns */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                                    {/* Condition Dropdown */}
                                    <FormControl fullWidth>
                                        <InputLabel>Condition</InputLabel>
                                        <Select
                                            value={condition}
                                            label="Condition"
                                            onChange={(e) => {
                                                setCondition(e.target.value);
                                                setDonor(''); // Reset donor when condition changes
                                            }}
                                        >
                                            {conditionOptions.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    {/* Donor Dropdown */}
                                    <FormControl fullWidth>
                                        <InputLabel>Donor</InputLabel>
                                        <Select
                                            value={donor}
                                            label="Donor"
                                            onChange={(e) => setDonor(e.target.value)}
                                            disabled={!condition}
                                        >
                                            {(donorOptionsByCondition[condition] || []).map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    {/* FOV Dropdown */}
                                    <FormControl fullWidth>
                                        <InputLabel>FOV</InputLabel>
                                        <Select
                                            value={fov}
                                            label="FOV"
                                            onChange={(e) => setFov(e.target.value)}
                                            disabled={!donor}
                                        >
                                            {(fovOptionsByDonor[donor] || []).map(fovNum => (
                                                <MenuItem key={fovNum} value={fovNum}>
                                                    {fovNum}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    {/* GeneDisplay Dropdown */}
                                    <FormControl fullWidth>
                                        <InputLabel>GeneDisplay</InputLabel>
                                        <Select
                                            value={geneDisplay}
                                            label="GeneDisplay"
                                            onChange={(e) => setGeneDisplay(e.target.value)}
                                        >
                                            {geneDisplayOptions.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                {/* Conditional 5th Dropdown for Single Gene */}
                                {geneDisplay === 'Single Gene' && (
                                    <Box sx={{mb:3}}>
                                        <FormControl fullWidth>
                                            <InputLabel>Single Gene</InputLabel>
                                            <Select
                                                value={singleGene}
                                                label="Single Gene"
                                                onChange={(e) => setSingleGene(e.target.value)}
                                            >
                                                {singleGeneOptions.map((option) => (
                                                    <MenuItem key={option} value={option}>
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                )}
                                
                                {/* Conditional Text Input for Multi Gene */}
                                {geneDisplay === 'Multi Gene (Max 3)' && (
                                    <Box >
                                        {/* Disclaimers */}
                                        <Box sx={{ mb:3 , p: 1, bgcolor: 'warning.light' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold'}}>
                                                Note:
                                            </Typography>
                                            <Typography variant="body2">
                                                • Image generation may take up to 10 minutes. Please only use when necessary.
                                            </Typography>
                                        </Box>
                                        
                                        <TextField
                                            fullWidth
                                            label="Enter genes (comma-separated, max 3)"
                                            value={multiGeneInput}
                                            onChange={(e) => setMultiGeneInput(e.target.value)}
                                            placeholder="e.g., INS, GCG, SST"
                                            helperText="Enter up to 3 genes separated by commas"
                                            variant="outlined" 
                                            sx={{mb:1}}
                                        />
                                        
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            helperText="Required for multi-gene requests"
                                            variant="outlined"
                                            error={email && !isValidEmail(email)}
                                            sx={{mb:1}}
                                        />
                                    </Box>
                                )}
                                
                                {/* Submit Button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSubmit}
                                    color='SiteSecondaryColor'
                                    disabled={!isSubmitActive() || isLoading}
                                    sx={{ 
                                        height: 50,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {isLoading ? 'Generating...' : 'Generate FOV Image'}
                                </Button>
                            </Paper>
                        </item>
                    </Grid>
                    
                    {/* Right side - Image Display */}
                    <Grid size={8}>
                        <item>
                            <Paper elevation={3} sx={{ borderRadius: '1rem' }}>
                                {errorMessage && (
                                    <Alert severity="error" sx={{ m: 2 }}>
                                        {errorMessage}
                                    </Alert>
                                )}
                                
                                {isLoading && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                                        <Typography>Loading image...</Typography>
                                    </Box>
                                )}
                                
                                {!isLoading && imageUrl && (
                                    <Box
                                        component="img"
                                        src={imageUrl}
                                        alt="Generated FOV Image"
                                        sx={{
                                            width: '100%',
                                            maxWidth: 800,
                                            aspectRatio: '1 / 1',
                                            objectFit: 'contain',
                                            display: 'block',
                                            margin: 'auto',
                                            padding: 2,
                                        }}
                                        onError={() => {
                                            setErrorMessage('Failed to load image. Please check your parameters and try again.');
                                            setImageUrl('');
                                        }}
                                    />
                                )}
                                
                                {!isLoading && !imageUrl && !errorMessage && (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            maxWidth: 800,
                                            aspectRatio: '1 / 1',
                                            objectFit: 'contain',
                                            margin: 'auto',
                                            padding: 2,
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                        }}>
                                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                                <b>Ready to Explore</b>
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Select parameters and click "Generate FOV Image" to view the result
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

export default FOV;