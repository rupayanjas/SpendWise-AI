import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

export class AIController {
  async generateAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const analysis = await aiService.generateFinancialAnalysis(userId);
      
      res.status(200).json({ analysis });
    } catch (error: any) {
      console.error('Error generating AI analysis:', error);
      
      // Handle known errors (e.g., Gemini rate limit)
      if (error?.status === 429) {
        return res.status(429).json({ error: 'Too many requests to the AI service. Please try again later.' });
      }
      
      if (error?.status === 401 || error?.status === 403) {
        return res.status(500).json({ error: 'AI service configuration error.' });
      }

      res.status(500).json({ error: 'Failed to generate financial analysis. Please try again.' });
    }
  }

  async getDashboardInsights(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const insights = await aiService.generateDashboardInsights(userId);
      res.status(200).json(insights);
    } catch (error: any) {
      console.error('Error generating AI dashboard insights:', error);
      
      if (error?.status === 429) {
        return res.status(429).json({ error: 'Too many requests to the AI service. Please try again later.' });
      }
      
      if (error?.status === 401 || error?.status === 403) {
        return res.status(500).json({ error: 'AI service configuration error.' });
      }

      res.status(500).json({ error: 'Failed to generate dashboard insights. Please try again.' });
    }
  }

  async chat(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const reply = await aiService.chatWithAI(userId, message);
      res.status(200).json({ reply });
    } catch (error: any) {
      console.error('Error generating AI chat response:', error);
      
      if (error?.status === 429) {
        return res.status(429).json({ error: 'Too many requests to the AI service. Please try again later.' });
      }
      
      if (error?.status === 401 || error?.status === 403) {
        return res.status(500).json({ error: 'AI service configuration error.' });
      }

      res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
  }
}

export const aiController = new AIController();
