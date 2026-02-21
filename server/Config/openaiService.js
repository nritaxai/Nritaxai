import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Primary AI: OpenRouter with NRI tax constraint
export const generateChatResponse = async (userMessages) => {
  // System prompt to constrain AI to NRI tax
  const systemMessage = {
    role: "system",
    content: "You are an AI assistant specialized in NRI tax matters. Only answer questions related to NRI tax. If a question is unrelated, politely reply: 'I can only answer questions related to NRI tax.'"
  };

  const messages = [systemMessage, ...userMessages];

  try {
    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nritaxai.vercel.app",
        "X-Title": "NRITAX AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: messages,
        temperature: 0
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenRouter API error");
    }

    const answer = data.choices[0].message.content;

    // If AI indicates out-of-scope, use fallback
    if (answer.includes("I can only answer questions related to NRI tax")) {
      return await fallbackResponse(userMessages);
    }

    return answer;

  } catch (error) {
    console.error("OpenRouter Error:", error.message);
    return await fallbackResponse(userMessages);
  }
};

// Fallback response if AI fails or question is unrelated
const fallbackResponse = async (messages) => {
  try {
    return "I can only answer NRI tax-related questions. For other topics, please consult another source.";

    // Optional: call another API as fallback (HuggingFace, GPT-2, etc.)
    /*
    const prompt = messages.map(m => m.content).join("\n");
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    const data = await response.json();
    return data[0]?.generated_text || "Fallback AI could not generate a response.";
    */
  } catch (fallbackError) {
    console.error("Fallback Error:", fallbackError.message);
    return "All AI services are currently unavailable. Please try again later.";
  }
};
