'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth'; // Ensure this is correctly imported
import { useRouter } from 'next/navigation'; // Adjust import if necessary
import { auth } from './firebase/config'; // Adjust path to your Firebase config

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Smart Pantry support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userSession = sessionStorage.getItem('user');

    if (!user && !userSession) {
      router.push('/sign-up');
    }
  }, [user, router]);

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        result += text;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessages = prevMessages.slice(0, prevMessages.length - 1);
          return [...updatedMessages, { ...lastMessage, content: lastMessage.content + text }];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="400px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
