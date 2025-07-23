import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { Container, Box, Paper, List, ListItem, ListItemText, TextField, Button, Typography, Modal, IconButton, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';

// Configuration constants
let BASEURL = '';
if (process.env.NODE_ENV === 'development') {
  BASEURL = 'http://localhost:9035';
}

const AI_CHAT_URL = `${BASEURL}/chat`; // Backend endpoint for chat API
const TEST_MODE = true; // Set to false to use real backend

function AIChat() {
  const theme = useTheme();
  const location = useLocation();
  const initialInput = location.state?.chatInput || '';

  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('display-history');
    return stored ? JSON.parse(stored) : (initialInput ? [{ type: 'user', content: initialInput }] : []);
  });

  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageClick = (imageSrc) => {
    setLightboxImage(imageSrc);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
  };

  const prompts = [
    "Show me the gene expression for INS in Beta cells.",
    "What is the cell composition in FOV 101 for a T1D donor?",
    "Compare gene expression of GCG between Control and T1D."
  ];

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  const clearHistory = () => {
    if (waiting) return;
    localStorage.setItem('openai-history', JSON.stringify([]));
    localStorage.setItem('display-history', JSON.stringify([]));
    setMessages([]);
  };

  const simulateBackendResponse = async (content) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (content.toLowerCase().includes('image') || content.toLowerCase().includes('png')) {
      return {
        messages: [
          { type: 'text', content: 'Here is the image you requested:' },
          { type: 'image', content: `${process.env.PUBLIC_URL}/imgs/example.png` }
        ],
        history: JSON.parse(localStorage.getItem('openai-history') || '[]')
      };
    } else {
      return {
        messages: [
          { type: 'text', content: `This is a test response to: "${content}". The AI backend is working correctly!` }
        ],
        history: JSON.parse(localStorage.getItem('openai-history') || '[]')
      };
    }
  };

  const sendMessage = async (content) => {
    if (waiting || !content.trim()) return;
    setWaiting(true);

    let openaiHistory = JSON.parse(localStorage.getItem('openai-history') || '[]');
    openaiHistory.push({ role: 'user', content });
    localStorage.setItem('openai-history', JSON.stringify(openaiHistory));

    const newMessages = [...messages, { type: 'user', content }, { type: 'text', content: 'Loading ......' }];
    setMessages(newMessages);
    localStorage.setItem('display-history', JSON.stringify(newMessages));

    try {
      let data = TEST_MODE
        ? await simulateBackendResponse(content)
        : await fetch(AI_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(openaiHistory),
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            return res.json();
          });

      let updatedMessages = [...newMessages];
      updatedMessages.pop();
      if (Array.isArray(data.messages)) {
        updatedMessages = [...updatedMessages, ...data.messages];
      }
      setMessages(updatedMessages);
      localStorage.setItem('display-history', JSON.stringify(updatedMessages));
      if (data.history) {
        localStorage.setItem('openai-history', JSON.stringify(data.history));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setWaiting(false);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (initialInput) {
      sendMessage(initialInput);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>AI Chat</Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={clearHistory}
            disabled={waiting}
            sx={{ borderRadius: '999px', px: 3 }}
          >
            Clear History
          </Button>
        </Box>

        <Paper elevation={3} sx={{
          height: 580,
          overflowY: 'auto',
          p: 2,
          borderRadius: 4,
          bgcolor: '#f7f9fb',
          border: '1px solid #dbe2ef',
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ flexGrow: 1 }} ref={listRef}>
            {messages.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                <Typography variant="h6" textAlign="center">Try one of these prompts:</Typography>
                <Grid container spacing={2} justifyContent="center">
                  {prompts.map((prompt, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Card onClick={() => handlePromptClick(prompt)} sx={{
                        cursor: 'pointer',
                        borderRadius: 4,
                        p: 1,
                        border: '2px solid transparent',
                        transition: 'border-color 0.3s ease',
                        '&:hover': {
                          borderColor: '#118ab2'
                        }
                      }}>
                        <CardContent>
                          <Typography>{prompt}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <List>
                {messages.map((msg, idx) => (
                  <ListItem key={idx} sx={{ justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Paper sx={{
                      p: 1.5,
                      bgcolor: msg.type === 'user' ? '#118ab2' : '#dbe2ef',
                      color: msg.type === 'user' ? '#fff' : '#000',
                      borderRadius: 3,
                      maxWidth: '70%'
                    }}>
                      {msg.type === 'image' ? (
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <img
                            src={msg.content}
                            alt="sent"
                            style={{ maxWidth: 200, maxHeight: 200, margin: 8, cursor: 'pointer' }}
                            onClick={() => handleImageClick(msg.content)}
                          />
                        </Box>
                      ) : (
                        <Typography>{msg.content}</Typography>
                      )}
                    </Paper>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box display="flex" alignItems="center" mt={2} px={1} sx={{
            backgroundColor: '#fff',
            border: '1px solid #118ab2',
            borderRadius: '10rem',
            width: '95%',
            alignSelf: 'center'
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              sx={{
                ml: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10rem',
                  backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#fff' },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&.Mui-focused fieldset': { borderColor: '#fff' },
                },
              }}
              disabled={waiting}
            />
            <Button
              variant="contained"
              color="SiteSecondaryColor"
              onClick={handleSend}
              disabled={waiting}
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
        </Paper>
      </Container>

      {/* Lightbox Modal for full-size image viewing */}
        <Modal
          open={lightboxOpen}
          onClose={handleCloseLightbox}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 1
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleCloseLightbox}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* Full-size image */}
            <img
              src={lightboxImage}
              alt="Full size"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
              }}
            />
          </Box>
        </Modal>
      <Footer />
    </div>
  );
}

export default AIChat;
