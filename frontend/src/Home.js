import React, { useState } from 'react';
import { keyframes } from '@emotion/react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { useNavigate } from 'react-router-dom';

const slideUpIn = keyframes`
  0% { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const STATS = [
  { label: 'Total Subjects', hint: '4 disease stages · 5 each', value: '20' },
  { label: 'Cells Profiled', hint: 'single-cell resolution', value: '1.14M' },
  { label: 'Fields of View', hint: 'spatial FOVs', value: '408' },
  { label: 'Genes Measured', hint: 'per cell panel', value: '1,000' },
];

const STAGES = [
  {
    id: 'ctrl',
    index: 'STAGE 01',
    title: 'Control',
    desc: 'Healthy donors with no autoimmunity or pancreatic pathology.',
    subjects: '5 subjects',
    borderColor: '#059669',
    pillBg: '#ecfdf5',
  },
  {
    id: 'ab1',
    index: 'STAGE 02',
    title: 'AB⁺LN⁻',
    desc: 'Autoantibody-positive without lymphocyte infiltration in islets.',
    subjects: '5 subjects',
    borderColor: '#d97706',
    pillBg: '#fffbeb',
  },
  {
    id: 'ab2',
    index: 'STAGE 03',
    title: 'AB⁺LN⁺',
    desc: 'Autoantibody-positive with active lymphocyte infiltration (insulitis).',
    subjects: '5 subjects',
    borderColor: '#ea580c',
    pillBg: '#fff7ed',
  },
  {
    id: 't1d',
    index: 'STAGE 04',
    title: 'Clinical T1D',
    desc: 'Established clinical type 1 diabetes diagnosis.',
    subjects: '5 subjects',
    borderColor: '#dc2626',
    pillBg: '#fef2f2',
  },
];

const FEATURES = [
  {
    icon: '🧬',
    title: 'Spatial Gene Expression',
    desc: 'Visualize 1,000-gene panels with full spatial context across 408 FOVs from human pancreatic tissue sections.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Analysis',
    desc: 'Chat with AI to explore cell-type-specific expression changes and cross-stage differential analysis.',
  },
  {
    icon: '🔬',
    title: 'Single-Cell Resolution',
    desc: 'Over 1.1M individually profiled cells with cell type annotations and spatial coordinates preserved.',
  },
];

const PROMPTS = [
  'Show me the gene expression for INS in Beta cells.',
  'What is the cell composition in FOV 101 for a T1D donor?',
  'Compare gene expression of GCG between Control and T1D.',
];

function Home() {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <NavBar />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 7 } }}>
      {/* Hero */}
      <Box
        sx={{
          pt: 9,
          pb: 8,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
          gap: { xs: 4, md: 9 },
          alignItems: 'start',
        }}
      >
        <Box>
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
              mb: 2.5,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '0ms',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 2,
                bgcolor: 'primary.main',
                borderRadius: '2px',
              }}
            />
            Interactive Research Platform
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Source Serif 4", serif',
              fontSize: { xs: '2rem', sm: 'clamp(2.2rem, 4vw, 3rem)' },
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
              color: 'navy.main',
              mb: 2.5,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '50ms',
            }}
          >
            Explore the <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>T1D Spatial</Box>
            <br />
            Atlas
          </Typography>
          <Typography
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              lineHeight: 1.75,
              maxWidth: 520,
              mb: 4.5,
              opacity: 0,
              animation: `${slideUpIn} 0.4s ease-out forwards`,
              animationDelay: '100ms',
            }}
          >
            An AI-powered platform for analyzing CosMX (NanoString) spatial transcriptomics data from human pancreatic tissues. Single-cell spatial datasets from 20 donors representing key stages of type 1 diabetes progression.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
              onClick={() => navigate('/FOV')}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 3,
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                boxShadow: 1,
                opacity: 0,
                animation: `${slideUpIn} 0.4s ease-out forwards`,
                animationDelay: '170ms',
                '&:hover': {
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Launch Explorer
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 20 }} />}
              onClick={() => navigate('/Help')}
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                px: 3,
                py: 1.5,
                borderRadius: 1,
                borderColor: 'border.light',
                color: 'text.primary',
                textTransform: 'none',
                opacity: 0,
                animation: `${slideUpIn} 0.4s ease-out forwards`,
                animationDelay: '240ms',
                '&:hover': {
                  borderColor: 'accent.border',
                  color: 'primary.main',
                  bgcolor: 'primary.light',
                },
              }}
            >
              Documentation
            </Button>
          </Box>
        </Box>

        {/* Stats panel */}
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            position: { md: 'sticky' },
            top: { md: 84 },
            opacity: 0,
            animation: `${slideUpIn} 0.4s ease-out forwards`,
            animationDelay: '300ms',
          }}
        >
          <Box
            sx={{
              py: 2,
              px: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                letterSpacing: '0.7px',
                textTransform: 'uppercase',
              }}
            >
              Dataset Summary
            </Typography>
            <Box
              component="span"
              sx={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                bgcolor: 'primary.light',
                color: 'primary.main',
                px: 1,
                py: 0.375,
                borderRadius: 0.5,
                fontWeight: 500,
              }}
            >
              CosMX · v1.0
            </Box>
          </Box>
          <Box sx={{ py: 1 }}>
            {STATS.map((row, i) => (
              <Box
                key={row.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.75,
                  px: 3,
                  borderTop: i === 0 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.default' },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'text.primary' }}>
                    {row.label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.7rem', color: 'text.disabled', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {row.hint}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Source Serif 4", serif',
                    fontSize: '1.55rem',
                    fontWeight: 700,
                    color: 'navy.main',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                  }}
                >
                  {row.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Disease stages */}
      <Box sx={{ pb: 9 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5, width: '100%' }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'text.disabled',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Disease Progression
          </Typography>
          <Box sx={{ flex: 1, height: '1px', minWidth: 0, bgcolor: 'divider' }} />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1.75,
            alignItems: 'stretch',
          }}
        >
          {STAGES.map((stage) => (
            <Card
              key={stage.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 3,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
                minHeight: 0,
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: stage.borderColor,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    color: 'text.disabled',
                    letterSpacing: '0.8px',
                    mb: 1.25,
                  }}
                >
                  {stage.index}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Source Serif 4", serif',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: stage.borderColor,
                    mb: 1.25,
                  }}
                >
                  {stage.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6, mb: 2.25 }}>
                  {stage.desc}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '100px',
                    bgcolor: stage.pillBg,
                    color: stage.borderColor,
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: 'currentColor',
                    }}
                  />
                  {stage.subjects}
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Platform capabilities */}
      <Box sx={{ pb: 9 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5, width: '100%' }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'text.disabled',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Platform Capabilities
          </Typography>
          <Box sx={{ flex: 1, height: '1px', minWidth: 0, bgcolor: 'divider' }} />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.75,
            alignItems: 'stretch',
          }}
        >
          {FEATURES.map((feat) => (
            <Card
              key={feat.title}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 3.5,
                transition: 'all 0.2s',
                minHeight: 0,
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                  borderColor: 'accent.border',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.light',
                  borderRadius: 1.125,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  mb: 2,
                }}
              >
                {feat.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Source Serif 4", serif',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'navy.main',
                  mb: 1,
                }}
              >
                {feat.title}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.65 }}>
                {feat.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Citation */}
      <Box sx={{ pb: 9 }}>
        <Box
          sx={{
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '3px solid',
            borderLeftColor: 'primary.main',
            borderRadius: '0 10px 10px 0',
            py: 2.5,
            px: 3.5,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'primary.main',
              whiteSpace: 'nowrap',
            }}
          >
            Citation
          </Typography>
          <Typography
            sx={{
              fontSize: '0.82rem',
              color: 'text.secondary',
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1.5,
            }}
          >
            T1D Spatial Atlas · CosMX (NanoString) · Human Pancreatic Tissue · 20 Donors · 1,139,248 Cells · 408 FOVs · 1,000 Genes
          </Typography>
        </Box>
      </Box>

      {/* Explore with AI */}
      <Box sx={{ pb: 9 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5, width: '100%' }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'text.disabled',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Try AI
          </Typography>
          <Box sx={{ flex: 1, height: '1px', minWidth: 0, bgcolor: 'divider' }} />
        </Box>
        <Typography
          sx={{
            fontFamily: '"Source Serif 4", serif',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'navy.main',
            mb: 3,
          }}
        >
          Ask the atlas
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            mb: 3,
            alignItems: 'stretch',
          }}
        >
          {PROMPTS.map((prompt, idx) => (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                borderColor: 'divider',
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: 0,
                '&:hover': {
                  borderColor: 'primary.light',
                  bgcolor: 'primary.light',
                  boxShadow: 1,
                },
              }}
              onClick={() => navigate('/AIChat', { state: { chatInput: prompt } })}
            >
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.primary' }}>
                  {prompt}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: 640,
            mx: 'auto',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 10,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            placeholder="Ask AI anything..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && chatInput.trim()) {
                navigate('/AIChat', { state: { chatInput } });
              }
            }}
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                bgcolor: 'background.paper',
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => chatInput.trim() && navigate('/AIChat', { state: { chatInput } })}
            sx={{
              m: 1,
              minWidth: 40,
              minHeight: 40,
              width: 40,
              height: 40,
              borderRadius: '50%',
              p: 0,
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </Button>
        </Box>
      </Box>

      </Box>

      <Footer />
    </Box>
  );
}

export default Home;
