// lib/ai.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Choose your model - Flash is perfect for most tasks
const MODEL = 'gemini-2.5-flash'; // Fast, efficient, free tier

export async function getAIResponse(systemPrompt, userPrompt, options = {}) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: options.model || MODEL,
      generationConfig: {
        temperature: options.temperature || 0.3,
        maxOutputTokens: options.maxTokens || 1000,
      }
    });

    // Combine system prompt and user prompt
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle rate limits gracefully
    if (error.message.includes('429')) {
      console.log('Rate limit reached, waiting...');
      // Implement retry logic
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
      return getAIResponse(systemPrompt, userPrompt, options); // Retry
    }
    
    return null;
  }
}

// For streaming responses (great for chat features)
export async function* streamAIResponse(systemPrompt, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await model.generateContentStream(fullPrompt);
    
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  } catch (error) {
    console.error('Streaming error:', error);
  }
}