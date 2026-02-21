import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Primary AI: OpenRouter with NRI tax constraint
export const generateChatResponse = async (userMessages) => {
  // System prompt to constrain AI to NRI tax
  const systemMessage = {
    role: "system",
    content:
      "You are an AI assistant specialized in NRI tax matters. Only answer questions related to NRI tax. If a question is unrelated, politely reply: 'I can only answer questions related to NRI tax.'",
  };

  const messages = [systemMessage, ...userMessages];

  try {
    // Call OpenRouter API with streaming enabled
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nritax.ai",
          "X-Title": "NRITAX AI",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: messages,
          temperature: 0,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "OpenRouter API error");
    }

    let answer = "";

    // 🔥 Read streaming response properly
    const reader = response.body;
    reader.setEncoding("utf8");

    for await (const chunk of reader) {
      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data:"));

      for (const line of lines) {
        const message = line.replace("data:", "").trim();

        if (message === "[DONE]") {
          break;
        }

        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices?.[0]?.delta?.content;

          if (content) {
            answer += content;
          }
        } catch (err) {
          // Ignore invalid JSON chunks
        }
      }
    }

    // If AI indicates out-of-scope, use fallback
    if (
      answer.includes(
        "I can only answer questions related to NRI tax"
      )
    ) {
      return await fallbackResponse(userMessages);
    }

    return answer;
  } catch (error) {
    console.error("OpenRouter Error:", error.message);
    return await fallbackResponse(userMessages);
  }
};

// Fallback response if AI fails or question is unrelated
const fallbackResponse = async () => {
  try {
    return "I can only answer NRI tax-related questions. For other topics, please consult another source.";
  } catch (fallbackError) {
    console.error("Fallback Error:", fallbackError.message);
    return "All AI services are currently unavailable. Please try again later.";
  }
};