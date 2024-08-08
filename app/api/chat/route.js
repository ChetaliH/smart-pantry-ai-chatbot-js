import { NextResponse } from "next/server";
import OpenAI from 'openai';

const systemPrompt= "Hello, welcome to the Smart Pantry customer support assistant. How can I assist you today? I'm happy to help you find recipes based on the ingredients you have in your pantry, provide nutritional information, or answer any other questions you may have about the Smart Pantry platform. What would you like help with?"

export async function POST(req){ //We are using POST function in API because we want to send and receive values
    const openai = new OpenAI() //An instance of OpenAI
    const data = await req.json() //Awaiting response from .json file interacting with the API

    const completion = await openai.chat.completions.create({
        messages: [{
            role: 'system',
            content: systemPrompt,
        },
        ...data,
    
        ],
        model: 'gpt-4o-mini',
        stream: true, // We are going to start the stream of messages to receive responses from OpenAI
    })

    const stream = new ReadableStream({ // Creating a stream variable and actually reading from the stream
        async start(controller){
            const encoder = new TextEncoder() // Encoder encodes your text ( maybe for protection/safety ).
            try{
                for await(const chunk of completion){ // OpenAI sends data in chunks
                    const content= chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text) // Sending the data to the controller
                    }
                }
            }
            catch(err){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}



