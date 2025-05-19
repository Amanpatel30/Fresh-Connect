import React, { useEffect } from 'react';
import { styled, Box, Typography, Avatar, TextField, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatContainer = styled(Box)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  height: '80%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: theme.spacing(2),
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ChatTopSection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3),
  borderRadius: '20px 20px 0 0',
  width: '97%',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
}));

const ChatBodySection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3, 3, 3),
  borderTop: '1px solid rgba(230, 230, 235, 0.8)',
  width: '97%',
  margin: '0 auto',
  height: '52%',
  borderRadius: '0 0 20px 20px',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  marginBottom: theme.spacing(2),
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  borderTop: '1px solid rgba(238, 238, 238, 0.5)',
}));

const UserMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(2),
}));

const AssistantMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
}));

const MessageContent = styled(Box)(({ theme }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ChatSection = (props) => {
  const messages = [
    {
      id: 1,
      sender: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: '10:32 AM',
    },
    {
      id: 2,
      sender: 'user',
      content: 'I need help with my project summary for the client presentation tomorrow.',
      timestamp: '10:33 AM',
    },
    {
      id: 3,
      sender: 'assistant',
      content: 'Sure, I can help you prepare a summary. What are the key points you want to highlight in your presentation?',
      timestamp: '10:33 AM',
    },
    {
      id: 4,
      sender: 'user',
      content: 'We need to showcase the progress made in the last sprint, especially the new dashboard features.',
      timestamp: '10:34 AM',
    },
    {
      id: 5,
      sender: 'assistant',
      content: 'Great! I\'ll help you structure a presentation focusing on the new dashboard features and sprint achievements. Would you like me to include some visual examples too?',
      timestamp: '10:35 AM',
    },
  ];

  useEffect(() => {
    console.log('ChatSection component loaded');
  }, []);

  return (
    <ChatContainer {...props}>
      <ChatHeader>
        <Box>
          <Typography variant="h6" fontWeight={600}>Intellecta Assistant</Typography>
          <Typography variant="body2" color="text.secondary">
            Your AI companion
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: '#6C63FF' }}>AI</Avatar>
      </ChatHeader>

      <ChatTopSection>
        <Typography variant="subtitle2" fontWeight={500}>
          Hi there! I'm a virtual assistant. How can I help you today?
        </Typography>
      </ChatTopSection>

      <ChatBodySection>
        <MessagesContainer>
          {messages.map((message) => (
            message.sender === 'user' ? (
              <UserMessage key={message.id}>
                <MessageContent 
                  data-isuser="true" 
                  sx={{ 
                    borderRadius: '18px 18px 0 18px',
                    backgroundColor: '#6C63FF',
                    color: 'white'
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', textAlign: 'right', mt: 0.5 }}>
                    {message.timestamp}
                  </Typography>
                </MessageContent>
              </UserMessage>
            ) : (
              <AssistantMessage key={message.id}>
                <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: '#6C63FF' }}>AI</Avatar>
                <MessageContent 
                  data-isuser="false"
                  sx={{ 
                    borderRadius: '18px 18px 18px 0',
                    backgroundColor: 'white',
                    color: 'inherit'
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5 }}>
                    {message.timestamp}
                  </Typography>
                </MessageContent>
              </AssistantMessage>
            )
          ))}
        </MessagesContainer>

        <ChatInputContainer>
          <InputContainer>
            <TextField
              fullWidth
              placeholder="Write a message"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: 'white',
                }
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: '#6C63FF',
                borderRadius: '50%',
                minWidth: 'auto',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: '#5046e5',
                }
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </InputContainer>
        </ChatInputContainer>
      </ChatBodySection>
    </ChatContainer>
  );
};

export default ChatSection; 