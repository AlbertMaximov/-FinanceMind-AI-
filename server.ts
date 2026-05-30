import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { userMessage, transactions, budgets, goals } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const context = `
        Вы - умный финансовый ассистент FinanceMind AI. Ваша задача - помогать пользователю принимать финансовые решения, анализировать данные и давать конкретные советы.
        Отвечайте кратко, по делу, используйте форматирование Markdown. Язык - русский.
        
        Текущие данные пользователя:
        Транзакции: ${JSON.stringify(transactions)}
        Бюджеты: ${JSON.stringify(budgets)}
        Цели: ${JSON.stringify(goals)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\nВопрос пользователя: ${userMessage}`,
      });

      res.json({ aiMessage: response.text || 'Извините, я не смог сгенерировать ответ.' });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
