import React, { useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import {
  Box,
  Typography,
  Button,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Modal,
} from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

const slideUpIn = keyframes`
  0% { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const CONDITION_LABELS = {
  'Control': 'Control',
  'AB+LN-': 'AB⁺LN⁻',
  'AB+LN+': 'AB⁺LN⁺',
  'T1D': 'T1D',
};

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

  const replaceAll = (string, a, b) => string.split(a).join(b);
  const isValidEmail = (email) => /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]+$/.test(email);

  const [condition, setCondition] = useState('');
  const [donor, setDonor] = useState('');
  const [fov, setFov] = useState('');
  const [geneDisplay, setGeneDisplay] = useState('None');
  const [singleGene, setSingleGene] = useState('');
  const [multiGeneInput, setMultiGeneInput] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [singleGeneOptions, setSingleGeneOptions] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [canvasHasContent, setCanvasHasContent] = useState(false);
  const [notifySent, setNotifySent] = useState(false);

  const conditionOptions = ['Control', 'AB+LN-', 'AB+LN+', 'T1D'];
  const donorOptionsByCondition = {
    'Control': ['HPAP-122', 'HPAP-129', 'HPAP-131', 'HPAP-140'],
    'AB+LN-': ['HPAP-024', 'HPAP-045', 'HPAP-072', 'HPAP-092', 'HPAP-148'],
    'AB+LN+': ['HPAP-008', 'HPAP-016', 'HPAP-029', 'HPAP-038', 'HPAP-107'],
    'T1D': ['HPAP-078', 'HPAP-084', 'HPAP-089', 'HPAP-123', 'HPAP-149'],
  };
  const fovOptionsByDonor = {
    'HPAP-008': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,94,95],
    'HPAP-016': [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93],
    'HPAP-024': [29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49],
    'HPAP-029': [49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,100],
    'HPAP-038': [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],
    'HPAP-045': [100,101,102,103],
    'HPAP-072': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28],
    'HPAP-078': [76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97],
    'HPAP-084': [34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
    'HPAP-089': [26,27,28,29,30,31,32,33,98,99,100],
    'HPAP-092': [50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74],
    'HPAP-107': [67,68,69,70,71,72,73,74,75,96,97,98,99],
    'HPAP-122': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    'HPAP-123': [51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75],
    'HPAP-129': [66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105],
    'HPAP-131': [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],
    'HPAP-140': [41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65],
    'HPAP-148': [75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99],
    'HPAP-149': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
  };
  const geneDisplayOptions = [
    { value: 'None', label: 'None' },
    { value: 'Single Gene', label: 'Single gene' },
    { value: 'Multi Gene (Max 3)', label: 'Multiple genes (maximum 3)' },
  ];

  useEffect(() => {
    fetch('/genes')
      .then((res) => res.json())
      .then((data) => setSingleGeneOptions(Array.isArray(data) ? data : []))
      .catch(() => setSingleGeneOptions([]));
  }, []);

  const isSubmitActive = () => {
    if (!condition || !donor || !fov) return false;
    if (geneDisplay === 'None') return true;
    if (geneDisplay === 'Single Gene') return !!singleGene;
    if (geneDisplay === 'Multi Gene (Max 3)') return !!multiGeneInput.trim() && isValidEmail(email);
    return false;
  };

  const doApply = async () => {
    setConfirmOpen(false);
    if (!condition || !donor || !fov) return;

    setIsLoading(true);
    setErrorMessage('');

    let errMsg = '';
    if (geneDisplay.startsWith('Single') && !singleGene) errMsg += 'Please select a gene. ';
    if (geneDisplay === 'Multi Gene (Max 3)') {
      if (!email) errMsg += 'Please enter an email address. ';
      else if (!isValidEmail(email)) errMsg += 'Please enter a valid email address. ';
    }
    if (errMsg) {
      setErrorMessage(errMsg);
      setIsLoading(false);
      return;
    }

    if (geneDisplay === 'Multi Gene (Max 3)') {
      const genes = multiGeneInput.split(',').map((g) => g.trim()).filter(Boolean);
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

    if (geneDisplay === 'None') {
      const link = `/spatial_plots/all_cells/${donor}/${donor}_${fov}_Image.png`;
      setImageUrl(link);
      setCanvasHasContent(true);
      setIsLoading(false);
      return;
    }

    if (geneDisplay === 'Single Gene') {
      const folderMap = { 'Control': 'CTRL', 'AB+LN-': 'ABposLNminus', 'AB+LN+': 'ABposLNpos', 'T1D': 'T1D' };
      const filenameMap = { 'Control': 'Control', 'AB+LN-': 'AB_plus_LN_minus', 'AB+LN+': 'AB_plus_LN_plus', 'T1D': 'T1D' };
      let gene = replaceAll(singleGene, '/', '.');
      gene = replaceAll(gene, ' ', '@');
      const link = `/spatial_plots/single_gene/${folderMap[condition]}/${donor}/${filenameMap[condition]}_${donor}_${fov}_${gene}.png`;
      setImageUrl(link);
      setCanvasHasContent(true);
      setIsLoading(false);
      return;
    }

    if (geneDisplay === 'Multi Gene (Max 3)') {
      try {
        const validGenes = multiGeneInput.split(',').map((g) => g.trim()).filter(Boolean);
        const filenameMap = { 'Control': 'Control', 'AB+LN-': 'AB_plus_LN_minus', 'AB+LN+': 'AB_plus_LN_plus', 'T1D': 'T1D' };
        const requestData = { f: 1, p1: filenameMap[condition], p2: donor, p3: parseInt(fov, 10), p4: validGenes.join(',') };
        const hexData = stringToHex(JSON.stringify(requestData));
        const fovApiBase = process.env.REACT_APP_FOV_API_URL || window.location.origin;
        const response = await fetch(`${fovApiBase}/fov/${hexData}`);
        if (response.ok) {
          const data = await response.json();
          if (data.img) {
            const imgDataUrl = `data:image/png;base64,${data.img}`;
            setImageUrl(imgDataUrl);
            setCanvasHasContent(true);
            await fetch(`${window.location.origin}/api/email_simple`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, image_data: imgDataUrl, donor, condition }),
            });
          } else setErrorMessage('No image data received from server.');
        } else {
          const err = await response.json().catch(() => ({}));
          setErrorMessage(err?.error || err?.msg || `HTTP ${response.status}`);
        }
      } catch (err) {
        setErrorMessage(err?.message || 'Network error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleApplyClick = () => {
    if (canvasHasContent && (imageUrl || isLoading)) {
      setConfirmOpen(true);
    } else {
      doApply();
    }
  };

  const selectedGenesForBadges = geneDisplay === 'Multi Gene (Max 3)'
    ? multiGeneInput.split(',').map((g) => g.trim()).filter(Boolean)
    : singleGene ? [singleGene] : [];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <NavBar />

      <Box sx={{ maxWidth: 1600, width: '100%', mx: 'auto', px: { xs: 2 , md: 6 } }}>
        {/* Page hero */}
        <Box sx={{ pt: 5, pb: 3 , marginX: '12%'}}>
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
            Spatial Explorer
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
            FOV Viewer
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
            Explore Fields of View across donors. Color cells by gene expression or cell type and navigate the spatial landscape of the pancreatic tissue.
          </Typography>
        </Box>

        {/* Divider between hero and content */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: 0, mb: 3, px: '5%' }}>
          <Box sx={{ width: '100%', height: '0.5px', bgcolor: 'divider' }} />
        </Box>

        {/* Viewer layout: left controls | right viewer */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            gap: 0,
            pt: 0,
            pb: 5,
            alignItems: 'start',
            marginX: '5%',
          }}
        >
          {/* Left column: controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              position: { md: 'sticky' },
              top: { md: 84 },
              alignSelf: 'start',
              borderRight: { md: '1px solid' },
              borderColor: { md: 'divider' },
              pr: { md: 4 },
              mr: { md: 4 },
              pb: { xs: 2, md: 0 },
              borderBottom: { xs: '1px solid', md: 'none' },
              borderBottomColor: { xs: 'divider' },
            }}
          >
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
              <Box sx={{ py: 1.75, px: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', letterSpacing: '0.7px', textTransform: 'uppercase' }}>
                Controls
              </Box>

              <Box sx={{ py: 1.75, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', letterSpacing: '0.7px', textTransform: 'uppercase', mb: 1.25 }}>
                  Condition
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={condition}
                    onChange={(e) => { setCondition(e.target.value); setDonor(''); setFov(''); }}
                    displayEmpty
                    sx={{ fontSize: '0.82rem', bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {conditionOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>{CONDITION_LABELS[opt] || opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ py: 1.75, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', letterSpacing: '0.7px', textTransform: 'uppercase', mb: 1.25 }}>
                  Donor
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={donor}
                    onChange={(e) => { setDonor(e.target.value); setFov(''); }}
                    displayEmpty
                    disabled={!condition}
                    sx={{ fontSize: '0.82rem', bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {(donorOptionsByCondition[condition] || []).map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ py: 1.75, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', letterSpacing: '0.7px', textTransform: 'uppercase', mb: 1.25 }}>
                  FOV
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={fov}
                    onChange={(e) => setFov(e.target.value)}
                    displayEmpty
                    disabled={!donor}
                    sx={{ fontSize: '0.82rem', bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {(fovOptionsByDonor[donor] || []).map((num) => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ py: 1.75, px: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', letterSpacing: '0.7px', textTransform: 'uppercase', mb: 1.25 }}>
                  Gene Display
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={geneDisplay}
                    onChange={(e) => setGeneDisplay(e.target.value)}
                    sx={{ fontSize: '0.82rem', bgcolor: 'background.default', borderRadius: 1 }}
                  >
                    {geneDisplayOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {(geneDisplay === 'Single Gene' || geneDisplay === 'Multi Gene (Max 3)') && (
                  <>
                    {geneDisplay === 'Multi Gene (Max 3)' && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'primary.light', borderRadius: 1, borderLeft: '2px solid', borderLeftColor: 'primary.main' }}>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', lineHeight: 1.55 }}>
                          Image generation may take up to 10 minutes. Please only use when necessary.
                        </Typography>
                      </Box>
                    )}
                    {geneDisplay === 'Single Gene' && (
                      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                        <InputLabel>Gene</InputLabel>
                        <Select value={singleGene} label="Gene" onChange={(e) => setSingleGene(e.target.value)}>
                          {singleGeneOptions.map((g) => (
                            <MenuItem key={g} value={g}>{g}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {geneDisplay === 'Multi Gene (Max 3)' && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="e.g. INS, GCG, SST"
                          value={multiGeneInput}
                          onChange={(e) => setMultiGeneInput(e.target.value)}
                          sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.82rem' } }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          error={!!email && !isValidEmail(email)}
                          sx={{ '& .MuiInputBase-input': { fontSize: '0.82rem' } }}
                        />
                      </Box>
                    )}
                  </>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleApplyClick}
                  disabled={!isSubmitActive() || isLoading}
                  sx={{ mt: 2, py: 1.25, fontWeight: 600, fontSize: '0.85rem', borderRadius: 1 }}
                >
                  {isLoading ? 'Generating…' : 'Apply'}
                </Button>
              </Box>
            </Card>
          </Box>

          {/* Right: viewer main */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
            {/* Toolbar badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ fontSize: '0.78rem', color: 'text.secondary', fontFamily: 'JetBrains Mono, monospace', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75, borderRadius: 1 }}>
                <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mr: 0.5 }}>Condition</Box>
                {condition ? (CONDITION_LABELS[condition] || condition) : '—'}
              </Box>
              <Box sx={{ fontSize: '0.78rem', color: 'text.secondary', fontFamily: 'JetBrains Mono, monospace', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75, borderRadius: 1 }}>
                <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mr: 0.5 }}>Donor</Box>
                {donor || '—'}
              </Box>
              <Box sx={{ fontSize: '0.78rem', color: 'text.secondary', fontFamily: 'JetBrains Mono, monospace', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75, borderRadius: 1 }}>
                <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mr: 0.5 }}>FOV</Box>
                {fov || '—'}
              </Box>
              {selectedGenesForBadges.map((g) => (
                <Box key={g} sx={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', color: 'text.secondary', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75, borderRadius: 1 }}>
                  {g}
                </Box>
              ))}
            </Box>

            {/* Canvas */}
            <Box
              sx={{
                flex: 1,
                minHeight: 480,
                bgcolor: '#f7f8fa',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
                {errorMessage && (
                  <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
                    {errorMessage}
                  </Alert>
                )}

                {isLoading && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4, width: '100%', maxWidth: 320 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'text.primary' }}>Generating FOV image…</Typography>
                    <Box sx={{ width: '100%', height: 6, bgcolor: 'action.selected', borderRadius: 99, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: '85%', bgcolor: 'primary.main', borderRadius: 99 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontFamily: 'JetBrains Mono, monospace' }}>Est. less than 10 minutes</Typography>
                    <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.25, textAlign: 'left' }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>Get notified when ready</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 1.25, lineHeight: 1.55 }}>Enter your email to receive a notification once the image is ready to view.</Typography>
                      <Box sx={{ display: 'flex', gap: 0.75 }}>
                        <TextField size="small" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                        <Button size="small" variant="contained" color="primary" disabled={notifySent || !email} onClick={() => email && setNotifySent(true)} sx={{ whiteSpace: 'nowrap' }}>{notifySent ? 'Sent ✓' : 'Notify me'}</Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {!isLoading && imageUrl && (
                  <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
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
                          src={imageUrl}
                          alt="FOV"
                          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                          onError={() => { setErrorMessage('Failed to load image.'); setImageUrl(''); }}
                        />
                      </TransformComponent>
                    </TransformWrapper>
                  </Box>
                )}

                {!isLoading && !imageUrl && !errorMessage && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.75, p: 4, textAlign: 'center' }}>
                    <Box sx={{ width: 52, height: 52, border: '2px dashed', borderColor: 'text.disabled', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'text.disabled' }}>⊙</Box>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>No FOV loaded</Typography>
                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'JetBrains Mono, monospace', lineHeight: 2.2, textAlign: 'left' }}>
                      <Box component="span" display="block">1 · Select Condition, Donor, and FOV</Box>
                      <Box component="span" display="block">2 · Choose Gene Display mode (optional)</Box>
                      <Box component="span" display="block">3 · Select gene(s) if applicable</Box>
                      <Box component="span" display="block">4 · Click <strong>Apply</strong> to generate</Box>
                    </Box>
                  </Box>
                )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Confirm re-apply */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
          <Card sx={{ maxWidth: 400, width: '100%', p: 3.5, borderRadius: 2 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', mb: 1.25 }}>Re-apply settings?</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.65, mb: 2.75 }}>
              This will replace the current view and may require re-running image generation. Are you sure you want to continue?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setConfirmOpen(false)} sx={{ fontSize: '0.82rem' }}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={doApply} sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Confirm</Button>
            </Box>
          </Card>
        </Box>
      </Modal>

      <Footer />
    </Box>
  );
}

export default FOV;
