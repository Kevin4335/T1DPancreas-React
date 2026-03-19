import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Modal,
  Stack,
  Typography,
} from '@mui/material';
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// ----------------------
// Config (keep same wiring as existing AIChat.js)
// ----------------------
let BASEURL = '';
if (process.env.NODE_ENV === 'development') {
  BASEURL = 'http://128.84.40.121';
}
const AI_CHAT_URL = `${BASEURL}/chat`;

const LS_OPENAI = 'openai-history';
const LS_DISPLAY = 'display-history';

const EXAMPLE_PROMPTS = [
  'Show me the gene expression for AATK in Beta cells.',
  'What is the figure for FOV 1 of Donor HPAP-129?',
  'What functions and features do you have at your disposal?',
];

function AIChat() {
  const location = useLocation();
  const initialInput = useMemo(() => (typeof location.state?.chatInput === 'string' ? location.state.chatInput : ''), [location.state]);

  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(LS_DISPLAY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return initialInput ? [{ type: 'user', content: initialInput }] : [];
  });

  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleImageClick = (src) => {
    setLightboxImage(src);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
  };

  const clearHistory = () => {
    if (waiting) return;
    localStorage.setItem(LS_OPENAI, JSON.stringify([]));
    localStorage.setItem(LS_DISPLAY, JSON.stringify([]));
    setMessages([]);
  };

  const sendMessage = async (content) => {
    if (waiting) return;
    const trimmed = (content || '').trim();
    if (!trimmed) return;

    setWaiting(true);

    const userMsg = { type: 'user', content: trimmed };
    const openaiHistory = [
      ...(JSON.parse(localStorage.getItem(LS_OPENAI) || '[]')),
      { role: 'user', content: trimmed },
    ];

    const nextDisplay = [...messages, userMsg];
    setMessages(nextDisplay);
    localStorage.setItem(LS_OPENAI, JSON.stringify(openaiHistory));
    localStorage.setItem(LS_DISPLAY, JSON.stringify(nextDisplay));

    try {
      const res = await fetch(AI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(openaiHistory),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const processed = (data.messages || []).map((m) => ({ type: m.type, content: m.content }));

      const finalMessages = [...messages, userMsg, ...processed];
      setMessages(finalMessages);
      localStorage.setItem(LS_DISPLAY, JSON.stringify(finalMessages));
      if (data.history) localStorage.setItem(LS_OPENAI, JSON.stringify(data.history));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      const errMsg = { type: 'text', content: `Error: ${msg}` };
      const finalMessages = [...messages, userMsg, errMsg];
      setMessages(finalMessages);
      localStorage.setItem(LS_DISPLAY, JSON.stringify(finalMessages));
    } finally {
      setWaiting(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const current = input;
    setInput('');
    void sendMessage(current);
  };

  useEffect(() => {
    if (!initialInput) return;
    void sendMessage(initialInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backgroundUrl = `${process.env.PUBLIC_URL}/imgs/main_background.svg`;

  const renderLanding = () => (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: '130% auto',
        backgroundPosition: '30% 30%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 6,
        }}
      >
        <Box
          sx={{
            width: '42%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '2.4vw',
              mb: '40px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ color: '#000000' }}>Welcome to T1D Spatial Atlas </Box>
            <Box component="span" sx={{ color: '#2563eb' }}>AI</Box>
          </Typography>

          <Box
            sx={{
              width: '100%',
              height: '19vh',
              mb: 3,
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <InputBase
              placeholder="Ask me anything about your data ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={waiting}
              multiline
              sx={{
                width: '100%',
                height: '100%',
                px: 2.5,
                py: 2,
                fontSize: '1rem',
                alignItems: 'flex-start',
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={waiting}
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                backgroundColor: '#2563eb',
                width: 36,
                height: 36,
                '&:hover': { backgroundColor: '#1d4fd8' },
                '&:disabled': { backgroundColor: '#cbd5e1' },
              }}
            >
              <ArrowOutwardOutlinedIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ width: '59%' }}>
          <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '0.9rem', mb: 0.8 }}>
            Examples:
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {EXAMPLE_PROMPTS.map((prompt) => (
              <Box
                key={prompt}
                onClick={() => void sendMessage(prompt)}
                sx={{
                  flex: 1,
                  height: '14.3vh',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  p: 1.5,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <Typography sx={{ color: '#2C2C2B', fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.4, pr: 3 }}>
                  {prompt}
                </Typography>
                <ArrowOutwardOutlinedIcon
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    color: '#2563eb',
                    fontSize: 18,
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const renderConversation = () => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#ffffff' }}>
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 2,
          pb: 2,
        }}
      >
        <Box sx={{ width: '42.75%', display: 'flex', flexDirection: 'column', gap: 3, pb: 3 }}>
          {messages.map((msg, idx) => {
            const isUser = msg.type === 'user';
            const isImage = msg.type === 'image';

            if (isUser) {
              return (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box
                    sx={{
                      maxWidth: '70%',
                      px: 1.5,
                      py: 1,
                      borderRadius: '12px',
                      backgroundColor: '#eff4ff',
                      color: '#000000',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </Typography>
                  </Box>
                </Box>
              );
            }

            return (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <FavoriteIcon sx={{ color: '#2563eb', fontSize: 22, mb: 1 }} />
                <Box sx={{ maxWidth: '85%' }}>
                  {isImage ? (
                    <Box sx={{ width: '100%', maxWidth: '100%' }}>
                      <img
                        src={msg.content}
                        alt="response"
                        style={{ maxWidth: '100%', maxHeight: 420, cursor: 'pointer', display: 'block', borderRadius: '8px' }}
                        onClick={() => handleImageClick(msg.content)}
                      />
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#000000', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}

          {waiting && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <FavoriteIcon sx={{ color: '#2563eb', fontSize: 22, mb: 0.5 }} />
              <Typography sx={{ fontSize: '0.9rem', color: '#9aa5b1' }}>Thinking...</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, pb: 0, backgroundColor: 'transparent' }}>
        {messages.length > 0 && (
          <Box sx={{ width: '42.75%', display: 'flex', justifyContent: 'flex-start', mb: 1, pl: 1 }}>
            <Button
              variant="outlined"
              onClick={clearHistory}
              disabled={waiting}
              sx={{
                color: 'primary.main',
                borderColor: 'primary.main',
                backgroundColor: '#ffffff',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                fontSize: '0.85rem',
                '&:hover': { borderColor: 'primary.main', backgroundColor: 'primary.light' },
              }}
            >
              Clear History
            </Button>
          </Box>
        )}

        <Box
          sx={{
            width: '42.75%',
            height: '16.8vh',
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '2%',
          }}
        >
          <InputBase
            placeholder="Ask me anything about your data ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={waiting}
            multiline
            sx={{
              width: '100%',
              height: '100%',
              px: 2.5,
              py: 2,
              fontSize: '1rem',
              alignItems: 'flex-start',
              '& .MuiInputBase-input': { height: '100% !important', overflow: 'auto !important' },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={waiting}
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: '#2563eb',
              width: 36,
              height: 36,
              '&:hover': { backgroundColor: '#1d4fd8' },
              '&:disabled': { backgroundColor: '#cbd5e1' },
            }}
          >
            <ArrowOutwardOutlinedIcon sx={{ color: '#ffffff', fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <NavBar />
      {messages.length === 0 ? renderLanding() : renderConversation()}
      <Footer />

      <Modal
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Box sx={{ position: 'relative', maxWidth: '92vw', maxHeight: '92vh', bgcolor: 'background.paper', borderRadius: '8px', p: 1 }}>
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0,0,0,0.55)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          <img src={lightboxImage} alt="Full size" style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'block' }} />
        </Box>
      </Modal>
    </Box>
  );
}

export default AIChat;
