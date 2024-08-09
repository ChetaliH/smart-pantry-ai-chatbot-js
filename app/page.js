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
    setMessage('') // To clear the input field
    setMessages((messages) => [
      ...messages,
      {role: 'user', content: message}, //To add user's message to the chat
      {role: 'assistant', content: ''}, // Adding a place holder for the assistant's chat
    ])

    //To send the message to the server =>
      const response = fetch('/api/chat', {
        method: 'POST', // The type of request made to the server
        headers: {
          'Content-Type' : 'application/json', // We are sending a JSON object as our message
        },
        body: JSON.stringify([...messages, { role: 'user', content: message}]), // The body will contain a string version of the content of the user message.
      }).then(async(res) => {
        const reader = res.body.getReader() //To read the response, we need a reader
        const decoder = new TextDecoder() // Since we had encoded the messages being typed into the TextField

        let result=''

        //To process the text from the response

        return reader.read().then(function processText({done,value}){
          if(done){
            return result
          }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        console.log(text)
        setMessages((messages) => {
            let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
            let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
            ]
        })
          return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
      })
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