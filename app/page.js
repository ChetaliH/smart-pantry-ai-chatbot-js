'use client'
import Image from "next/image";
import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([ // Messages is an array 
    {
      role: 'assistant',
      content: "Hi! I'm the Smart Pantry support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('') // For the user message

  const sendMessage = async () => {
    // We'll implement this function in the next section
  }

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
          overflow="auto" // To be able to scroll
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end' // If the message is from the assistant, display it from start. Else display it from end 
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
                p={3} // Content of the message the user types in the Text Field
              >
                {message.content} 
              </Box>
            </Box>
          ))}
        </Stack>
        
        <Stack direction={'row'} spacing={2}> 
          <TextField // Above, spacing is 2 row-wise because we need to make space for 'send' button
            label="Message"
            fullWidth
            value={message} //The entered message in TextField would parse into message variable
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
      
)}