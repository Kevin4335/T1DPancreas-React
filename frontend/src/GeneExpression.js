import React, { useEffect, useMemo, useState } from 'react';
import { keyframes } from '@emotion/react';
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

const slideUpIn = keyframes`
  0% { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const CELL_TYPES = [
  'Acinar', 'Alpha', 'Beta', 'Delta', 'Ductal', 'Endothelial', 'Mesenchymal',
  'B cells', 'Dendritic cells', 'Macrophages', 'Monocytes', 'Granulocytes',
  'NK cells', 'Pre-B cells', 'T cells', 'Unknown',
];

function GeneExpression() {
  const [geneInput, setGeneInput] = useState('INS');
  const [validGenes, setValidGenes] = useState(['INS']);
  const [geneOptions, setGeneOptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageData, setImageData] = useState('');

  const [selectedCellTypes, setSelectedCellTypes] = useState(
    CELL_TYPES.reduce((acc, ct) => {
      acc[ct] = false;
      return acc;
    }, {})
  );

  const GLB_API_SERVER_URL = 'http://128.84.40.121:5000';

  const replaceAll = (string, a, b) => string.split(a).join(b);

  const stringToHex = (str) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let hex = '';
    for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
    return hex;
  };

  const parseGenes = (input) => {
    if (!input.trim()) return [];
    let text = input.toUpperCase();
    text = replaceAll(text, ' ', '');
    text = replaceAll(text, '\n', ',');
    return text.split(',').filter((gene) => gene.trim() !== '');
  };

  const selectedCount = useMemo(
    () => Object.values(selectedCellTypes).filter(Boolean).length,
    [selectedCellTypes]
  );

  useEffect(() => {
    fetch(`${GLB_API_SERVER_URL}/genes`)
      .then((res) => res.json())
      .then((data) => setGeneOptions(Array.isArray(data) ? data : []))
      .catch(() => setGeneOptions([]));
  }, []);

  const simulateProgress = () => {
    let progressValue = 0;
    const increment = () => {
      if (progressValue < 80) {
        progressValue += 0.2;
        setProgress(progressValue);
        setTimeout(increment, 50);
      }
    };
    increment();
  };

  const handleGeneInputChange = (e) => {
    const input = e.target.value;
    setGeneInput(input);

    const parsed = parseGenes(input);
    setValidGenes(parsed);

    if (input.trim()) {
      const normalized = input.toUpperCase();
      const parts = normalized.split(/[,\n]/);
      const activeToken = (parts[parts.length - 1] || '').trim();
      const picked = new Set(parts.map((p) => p.trim()).filter(Boolean));
      const filtered = activeToken
        ? geneOptions
          .filter((g) => {
            const upper = (g || '').toUpperCase();
            return upper.startsWith(activeToken) && !picked.has(upper);
          })
          .slice(0, 20)
        : [];
      setSuggestions(filtered);
      setShowSugg(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSugg(false);
    }
  };

  const handleCellTypeChange = (cellType) => (e) => {
    setSelectedCellTypes((prev) => ({ ...prev, [cellType]: e.target.checked }));
  };

  const handleSearch = async () => {
    if (validGenes.length === 0) {
      setErrorMessage('Please enter at least one valid gene.');
      return;
    }

    const checkedCellTypes = Object.entries(selectedCellTypes)
      .filter(([, checked]) => checked)
      .map(([cellType]) => cellType);

    if (checkedCellTypes.length === 0) {
      setErrorMessage('Please select at least one cell type.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setImageData('');
    setProgress(0);
    simulateProgress();

    try {
      const requestData = {
        f: 2,
        p1: validGenes.join(','),
        p2: checkedCellTypes.join(','),
      };

      const jsonData = JSON.stringify(requestData);
      const hexData = stringToHex(jsonData);
      const url = `${GLB_API_SERVER_URL}/gene_exp/${hexData}`;

      // eslint-disable-next-line no-console
      console.log('Submitting gene expression request:', requestData);
      // eslint-disable-next-line no-console
      console.log('Request URL:', url);

      const response = await fetch(url, { method: 'GET' });

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
      setErrorMessage(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 250);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <NavBar />

      <Box sx={{ maxWidth: 1600, width: '100%', mx: 'auto', px: { xs: 2, md: 6 }, pb: 5 }}>
        <Box sx={{ pt: 5, pb: 3, marginX: '12%' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'primary.main',
              mb: 1.5,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '0ms',
            }}
          >
            <Box sx={{ width: 24, height: 2, bgcolor: 'primary.main', borderRadius: '2px' }} />
            Expression Analysis
          </Box>
          <Typography
            sx={{
              fontFamily: '"Source Serif 4", serif',
              fontSize: { xs: '1.75rem', md: '2rem' },
              fontWeight: 700,
              color: 'navy.main',
              letterSpacing: '-0.5px',
              mb: 1,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '50ms',
            }}
          >
            Gene Expression
          </Typography>
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: 'text.secondary',
              lineHeight: 1.75,
              maxWidth: 560,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '100ms',
            }}
          >
            Query any of the 1,000 measured genes across all 20 donors, cell types, and disease stages.
          </Typography>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 0, mb: 3, px: '5%' }}>
          <Box sx={{ width: '100%', height: '0.5px', bgcolor: 'divider' }} />
        </Box>

        <Box sx={{ px: '5%' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search gene (e.g. INS, HLA-A, CD8A, STAT1)…"
                value={geneInput}
                onChange={handleGeneInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                  if (e.key === 'Escape') setShowSugg(false);
                }}
                onFocus={() => { if (suggestions.length > 0) setShowSugg(true); }}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.9rem',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading}
                sx={{
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  py: 1.25,
                  px: 2.75,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Search
              </Button>
            </Box>

            {showSugg && suggestions.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 60,
                  mt: 0.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  boxShadow: 2,
                  zIndex: 200,
                  maxHeight: 196,
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((g) => (
                  <Box
                    key={g}
                    component="button"
                    type="button"
                    onMouseDown={() => {
                      const parts = geneInput.split(/[,\n]/);
                      parts[parts.length - 1] = g;
                      const next = `${parts.map((p) => p.trim()).filter(Boolean).join(', ')}, `;
                      setGeneInput(next);
                      setValidGenes(parseGenes(next));
                      setShowSugg(false);
                      setSuggestions([]);
                    }}
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      py: 1.125,
                      px: 2,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.85rem',
                      color: 'text.primary',
                      border: 'none',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      '&:last-of-type': { borderBottom: 'none' },
                      '&:hover': { bgcolor: 'primary.light', color: 'primary.main' },
                    }}
                  >
                    {g}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'navy.main', mb: 1.5, letterSpacing: '0.7px', textTransform: 'uppercase' }}>
              Cell Type Selection
            </Typography>
            <FormGroup>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 0.5 }}>
                {CELL_TYPES.map((cellType) => (
                  <FormControlLabel
                    key={cellType}
                    control={(
                      <Checkbox
                        size="small"
                        checked={selectedCellTypes[cellType]}
                        onChange={handleCellTypeChange(cellType)}
                        disabled={isLoading}
                      />
                    )}
                    label={<Typography sx={{ fontSize: '0.82rem' }}>{cellType}</Typography>}
                    sx={{ m: 0 }}
                  />
                ))}
              </Box>
            </FormGroup>
            <Typography sx={{ mt: 1, fontSize: '0.78rem', color: 'text.secondary' }}>
              Selected: {selectedCount}
            </Typography>
          </Card>

          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
            <Box
              sx={{
                py: 1.75,
                px: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                letterSpacing: '0.7px',
                textTransform: 'uppercase',
              }}
            >
              Expression Viewer
            </Box>

            <Box sx={{ p: 2 }}>
              {errorMessage && <Alert severity="error" sx={{ mb: 1.5 }}>{errorMessage}</Alert>}

              {isLoading && (
                <Box sx={{ mb: 1.5 }}>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
                  <Typography sx={{ mt: 0.5, fontSize: '0.78rem', color: 'text.secondary' }}>
                    {Math.round(progress)}% complete
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  border: imageData ? 'none' : '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: imageData ? 'transparent' : '#fbfdff',
                  minHeight: 460,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: imageData ? 0 : 3,
                }}
              >
                {imageData ? (
                  <Box sx={{ width: '100%', height: '100%', minHeight: 460 }}>
                    <TransformWrapper
                      initialScale={1}
                      minScale={0.5}
                      maxScale={8}
                      centerOnInit
                      limitToBounds={false}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <TransformComponent
                        wrapperStyle={{ width: '100%', height: '100%' }}
                        contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Box
                          component="img"
                          src={imageData}
                          alt="Gene expression result"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '72vh',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: 1,
                          }}
                        />
                      </TransformComponent>
                    </TransformWrapper>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', textAlign: 'center', maxWidth: 540 }}>
                    Select genes and cell types, then click Search to generate the expression plot.
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default GeneExpression;
