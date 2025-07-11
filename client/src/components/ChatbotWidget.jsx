import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: updatedHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
        config: {
          thinkingConfig: {
            thinkingBudget: 1024,
            includeThoughts: true,
          },
        },
      });

      const parts = result.candidates?.[0]?.content?.parts || [];

      const thoughts = parts
        .filter((p) => p.thought)
        .map((p) => p.text)
        .join('\n');

      const answer = parts
        .filter((p) => !p.thought)
        .map((p) => p.text)
        .join('\n');

      const messagesToAdd = [];
      if (thoughts) messagesToAdd.push({ role: 'thought', text: thoughts });
      messagesToAdd.push({ role: 'model', text: answer });

      setHistory((prev) => [...prev, ...messagesToAdd]);
    } catch (error) {
      console.error(error);
      setHistory((prev) => [
        ...prev,
        { role: 'model', text: '⚠️ Error: Unable to get response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        variant="contained"
        startIcon={<PsychologyIcon />}
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 20, sm: 30 },
          right: { xs: 20, sm: 30 },
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          borderRadius: '50px',
          padding: { xs: '8px 16px', sm: '10px 20px' },
          fontSize: { xs: '0.85rem', sm: '1rem' },
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 1200,
          minWidth: { xs: 'auto', sm: 'auto' },
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Ask AI</Box>
      </Button>

      {/* Chatbox */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 120 },
            right: { xs: 16, sm: 44 },
            width: { xs: '90vw', sm: 380 },
            height: { xs: '75vh', sm: 520 },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            zIndex: 1201,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AutoAwesomeIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={500}>
                AI Assistant
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showThoughts}
                    onChange={(e) => setShowThoughts(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#ffffff',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                        {
                          backgroundColor: 'rgb(68, 255, 139)',
                        },
                      '& .MuiSwitch-track': {
                        backgroundColor: 'rgba(255, 255, 255, 0.84)',
                      },
                    }}
                  />
                }
                label="Thoughts"
                labelPlacement="start"
                sx={{
                  '.MuiFormControlLabel-label': {
                    color: 'white',
                    fontSize: '0.75rem',
                  },
                }}
              />
              <IconButton size="small" onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2 },
              overflowY: 'auto',
              backgroundColor: '#f9f9f9',
            }}
          >
            {history.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Ask me anything...
              </Typography>
            )}

            {history
              .filter((msg) => msg.role !== 'thought' || showThoughts)
              .map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1.5,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor:
                        msg.role === 'user'
                          ? 'primary.light'
                          : msg.role === 'thought'
                          ? 'grey.100'
                          : 'grey.200',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: '85%',
                      fontStyle: msg.role === 'thought' ? 'italic' : 'normal',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={
                        msg.role === 'user'
                          ? 'primary.dark'
                          : msg.role === 'thought'
                          ? 'text.secondary'
                          : 'text.primary'
                      }
                      fontWeight={msg.role === 'user' ? 600 : 500}
                    >
                      {msg.role === 'user'
                        ? 'You'
                        : msg.role === 'model'
                        ? 'AI'
                        : '🧠 AI Thinking'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              ))}

            {loading && (
              <Box mt={1.5} pl={1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    display: 'inline-flex',
                    alignItems: 'center',
                    '&::after': {
                      content: '"..."',
                      animation: 'dots 1.5s steps(3, end) infinite',
                      fontWeight: 'bold',
                    },
                    '@keyframes dots': {
                      '0%': { content: '"."' },
                      '33%': { content: '".."' },
                      '66%': { content: '"..."' },
                      '100%': { content: '"."' },
                    },
                  }}
                >
                  AI Thinking
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Input */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 1.5 },
              bgcolor: 'background.paper',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              sx={{ mr: 1 }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              color="primary"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatbotWidget;
