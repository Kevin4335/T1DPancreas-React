import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { Container, Box, Paper, List, ListItem, ListItemText, TextField, Button, Typography, Modal, IconButton, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

// Configuration constants
let BASEURL = '';
if (process.env.NODE_ENV === 'development') {
  BASEURL = 'http://localhost:9035';
}

const AI_CHAT_URL = `${BASEURL}/chat`; // Backend endpoint for chat API
const TEST_MODE = false; // Set to false to use real backend

function AIChat() {
  const theme = useTheme();
  
  // Router location for getting initial input from navigation
  const location = useLocation();
  const initialInput = location.state?.chatInput || '';

  // State management
  const [messages, setMessages] = useState(() => {
    // Initialize messages from localStorage or initial input
    const stored = localStorage.getItem('display-history');
    return stored ? JSON.parse(stored) : (initialInput ? [{ type: 'user', content: initialInput }] : []);
  });
  
  const [input, setInput] = useState(''); // Current input field value
  const [waiting, setWaiting] = useState(false); // Loading state during API calls
  const [lightboxOpen, setLightboxOpen] = useState(false); // Lightbox modal visibility
  const [lightboxImage, setLightboxImage] = useState(''); // Current image in lightbox
  
  // Ref for auto-scrolling chat area
  const listRef = useRef(null);

  /**
   * Auto-scroll to bottom when new messages are added
   */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * Handle image click to open lightbox
   * @param {string} imageSrc - URL of the image to display
   */
  const handleImageClick = (imageSrc) => {
    setLightboxImage(imageSrc);
    setLightboxOpen(true);
  };

  /**
   * Close the lightbox modal
   */
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
  };

  // Pre-made chat prompts for quick start
  const prompts = [
    "Show me the gene expression for INS in Beta cells.",
    "What is the cell composition in FOV 101 for a T1D donor?",
    "Compare gene expression of GCG between Control and T1D."
  ];

  /**
   * Handle prompt card click to auto-fill input
   * @param {string} prompt - The selected prompt text
   */
  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  /**
   * Clear all chat history from localStorage and state
   * Prevents clearing while waiting for API response
   */
  const clearHistory = () => {
    if (waiting) return; // Don't clear while waiting for response
    localStorage.setItem('openai-history', JSON.stringify([]));
    localStorage.setItem('display-history', JSON.stringify([]));
    setMessages([]);
  };

  /**
   * Simulate backend response for testing purposes
   * Returns different responses based on input content
   * 
   * @param {string} content - User input message
   * @returns {Promise<Object>} Simulated API response
   */
  const simulateBackendResponse = async (content) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return test responses based on input content
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

  /**
   * Send message to backend and handle response
   * Manages loading states, localStorage updates, and message display
   * 
   * @param {string} content - Message content to send
   */
  const sendMessage = async (content) => {
    if (waiting || !content.trim()) return;
    setWaiting(true);

    // Update openai-history in localStorage
    let openaiHistory = JSON.parse(localStorage.getItem('openai-history') || '[]');
    openaiHistory.push({ role: 'user', content });
    localStorage.setItem('openai-history', JSON.stringify(openaiHistory));

    // Add user message and loading message to display
    const newMessages = [...messages, { type: 'user', content }, { type: 'text', content: 'Loading ......' }];
    setMessages(newMessages);
    localStorage.setItem('display-history', JSON.stringify(newMessages));
    try {
      let data;
      if (TEST_MODE) {
        // Use test mode for development
        data = await simulateBackendResponse(content);
      } else {
        // Use real backend API
        const response = await fetch(AI_CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(openaiHistory),
        });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        data = await response.json();
      }
      
      // Remove loading message and add new messages from backend
      let updatedMessages = [...newMessages];
      updatedMessages.pop(); // Remove loading message
      
      // Add new messages from backend response
      if (Array.isArray(data.messages)) {
        updatedMessages = [...updatedMessages, ...data.messages];
      }
      
      // Update state and localStorage
      setMessages(updatedMessages);
      localStorage.setItem('display-history', JSON.stringify(updatedMessages));
      
      // Update openai-history if provided by backend
      if (data.history) {
        localStorage.setItem('openai-history', JSON.stringify(data.history));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setWaiting(false);
    }
  };

  /**
   * Handle send button click or Enter key press
   */
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  /**
   * Send initial input on component mount if provided via navigation
   */
  useEffect(() => {
    if (initialInput) {
      sendMessage(initialInput);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation bar */}
      <Navbar />
      
      {/* Main chat container */}
      <Container>
        {/* Page title */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', marginTop: '1rem', textAlign: 'center'}}>
          AI Chat
        </Typography>
        
        {/* Clear history button */}
        <Grid container spacing={1} width='100%' height='2vw' marginTop={'1rem'}>
          <Grid size={2} offset={{ md: 'auto' }}>
            <item>
              <Button
                variant="contained"
                color="red"
                onClick={clearHistory}
                disabled={waiting}
                fullWidth
              >
                Clear History
              </Button>
            </item>
          </Grid>
        </Grid>
        
        {/* Chat area */}
        <Grid container spacing={3} width='100%' height='100%' marginTop={'1rem'}>
          <Grid size={12}>
            <item>
              <Paper elevation={3} 
                sx={{ 
                    height: 540,
                    overflowY: 'auto',
                    p: 2,
                    border: '2px solid black',
                    borderRight: '6px solid black',
                    borderBottom: '6px solid black',
                    borderRadius: '0'
                  }} 
                  ref={listRef}>
                
                {/* Conditional rendering based on message state */}
                {messages.length === 0 ? (
                  // Show example prompts when chat is empty
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                      Start a conversation with these example prompts:
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                      {prompts.map((prompt, idx) => (
                        <Grid item xs={12} sm={4} key={idx} sx={{ display: 'flex' }}>
                          <Card sx={{ 
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            backgroundColor: theme.palette.SiteSecondaryColor.main,
                            color: '#FFFFFF',
                            borderTop: '1px dotted black',
                            borderRight: '5px solid black',
                            borderBottom: '5px solid black',
                            borderLeft: '1px solid black',
                            boxShadow: 'none',
                            borderRadius: '0'
                          }}>
                            <CardActionArea
                              sx={{ height: '100%' }}
                              onClick={() => handlePromptClick(prompt)}
                            >
                              <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 500 }}>
                                  {prompt}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  // Show chat messages when there are messages
                  <List>
                    {messages.map((msg, idx) => (
                      <ListItem
                        key={idx}
                        sx={{
                          justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: msg.type === 'user' ? 'primary.main' : 'grey.200',
                            color: msg.type === 'user' ? 'primary.contrastText' : 'text.primary',
                            maxWidth: '75%',
                          }}
                          elevation={2}
                        >
                          {/* Render different message types */}
                          {msg.type === 'image' ? (
                            // Image message with lightbox functionality
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <img
                                src={msg.content}
                                alt="AI sent"
                                style={{ 
                                  maxWidth: 200, 
                                  maxHeight: 200, 
                                  margin: 8,
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }}
                                onClick={() => handleImageClick(msg.content)}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                              />
                            </Box>
                          ) : msg.type === 'error' ? (
                            // Error message with red styling
                            <ListItemText 
                              primary={msg.content} 
                              sx={{ 
                                color: 'red',
                                fontWeight: 'bold'
                              }}
                            />
                          ) : (
                            // Text message
                            <ListItemText primary={msg.content} />
                          )}
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </item>
          </Grid>
          
          {/* Input area */}
          <Grid size={12}>
            <item>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={waiting}
                />
                <Button
                  variant="contained"
                  color="SiteSecondaryColor"
                  onClick={handleSend}
                  disabled={waiting}
                >
                  Send
                </Button>
              </Box>
            </item>
          </Grid>
        </Grid>
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