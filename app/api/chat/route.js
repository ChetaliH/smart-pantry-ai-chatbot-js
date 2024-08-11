import { NextResponse } from "next/server";
import OpenAI from 'openai';

const systemPrompt = `Hello, welcome to the Smart Pantry customer support assistant. I'm here to help you find recipes, provide nutritional information, and answer questions about the Smart Pantry platform. Every few messages, I will ask for feedback on my responses. When I do, please rate my performance on a scale of 1-5, where 1 is poor and 5 is excellent. Simply respond with a number between 1 and 5 when asked for feedback. If you don't want to provide feedback, just say "skip" and we'll continue our conversation.`;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL,
    "X-Title": process.env.YOUR_SITE_NAME,
  }
});

let messageCount = 0;
let isFeedbackRequested = false;

export async function POST(req) {
  const data = await req.json();
  messageCount++;

  let messages = [
    { role: 'system', content: systemPrompt },
    ...data
  ];

  // Check if it's time to request feedback
  if (messageCount % 5 === 0 && !isFeedbackRequested) {
    messages.push({
      role: 'assistant',
      content: "I'd like to know how I'm doing. On a scale of 1-5, how would you rate my responses so far? (1 being poor, 5 being excellent)"
    });
    isFeedbackRequested = true;
  } 
  // Check if the last message was a feedback response
  else if (isFeedbackRequested) {
    const lastUserMessage = data[data.length - 1].content;
    if (/^[1-5]$/.test(lastUserMessage)) {
      // Process the feedback
      console.log(`Feedback received: ${lastUserMessage} stars`);
      // Here you would typically store this feedback in a database
      
      messages.push({
        role: 'assistant',
        content: `Thank you for your feedback! I've recorded your rating of ${lastUserMessage} stars. How else can I assist you today?`
      });
      isFeedbackRequested = false;
    } else if (lastUserMessage.toLowerCase() === 'skip') {
      messages.push({
        role: 'assistant',
        content: "No problem, let's continue our conversation. How else can I help you today?"
      });
      isFeedbackRequested = false;
    }
  }

  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.1-8b-instruct:free",
    messages: messages,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    }
  });

  return new NextResponse(stream);
}