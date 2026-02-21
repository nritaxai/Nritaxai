import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const chatWithAI = async (req, res) => {
  try {
    const rawMessage = req.body?.message ?? req.body?.messages;
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful tax assistant for NRITAX.AI.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.status(200).json({
      reply: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({
      error: "AI response failed",
    });
  }
};
