import { NextResponse } from "next/server";
import OpenAI from 'openai';

// Define your system prompt
const systemPrompt = "Hello, welcome to the Smart Pantry customer support assistant. How can I assist you today? I'm happy to help you find recipes based on the ingredients you have in your pantry, provide nutritional information, or answer any other questions you may have about the Smart Pantry platform. What would you like help with?";

// Create an instance of OpenAI with OpenRouter API settings
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Use environment variables for API key
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings
    "X-Title": process.env.YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai
  }
});

export async function POST(req) {
  // Await response from the request's JSON body
  const data = await req.json();

  // Create a chat completion request with the specified model
  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.1-8b-instruct:free", // Use the model specified in the second snippet
    messages: [
      { role: 'system', content: systemPrompt },
      ...data,
    ],
    stream: true, // Stream the response
  });

  // Create a readable stream for the response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        // Iterate over each chunk of data from the stream
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text); // Send the data to the controller
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    }
  });

  // Return the stream as the response
  return new NextResponse(stream);
}
