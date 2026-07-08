import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';
import prisma from '../utils/prisma';
import { TicketCategory, TicketPriority } from '@prisma/client';

// Lazy-initialise so the app still starts when no API key is set
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    if (!config.ai.apiKey || config.ai.apiKey === 'your-openai-api-key-here') {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    _client = new OpenAI({ apiKey: config.ai.apiKey });
  }
  return _client;
}

async function chat(systemPrompt: string, userContent: string): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: config.ai.model,
    max_tokens: config.ai.maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

export const aiService = {
  /** Classify ticket category and priority from title + description */
  async classifyTicket(
    ticketId: string,
    title: string,
    description: string
  ): Promise<{ category: TicketCategory; priority: TicketPriority; sentiment: string }> {
    const system = `You are a customer support classifier. Given a ticket title and description, respond with ONLY valid JSON in this exact shape:
{"category":"BILLING|PAYMENT|TECHNICAL|BUG|FEATURE_REQUEST|DELIVERY|REFUND|AUTHENTICATION|ACCOUNT|OTHER","priority":"LOW|MEDIUM|HIGH|URGENT","sentiment":"POSITIVE|NEUTRAL|NEGATIVE|FRUSTRATED"}`;

    const input = `Title: ${title}\nDescription: ${description}`;
    let raw = '';
    try {
      raw = await chat(system, input);
      const parsed = JSON.parse(raw);

      await prisma.aIHistory.create({
        data: {
          ticketId,
          action: 'CLASSIFY',
          input,
          output: raw,
          model: config.ai.model,
        },
      });

      return {
        category: parsed.category as TicketCategory,
        priority: parsed.priority as TicketPriority,
        sentiment: parsed.sentiment,
      };
    } catch (err) {
      logger.warn('AI classification failed:', err);
      return { category: TicketCategory.OTHER, priority: TicketPriority.MEDIUM, sentiment: 'NEUTRAL' };
    }
  },

  /** Summarise a ticket thread (title + description + messages) */
  async summariseTicket(ticketId: string, title: string, description: string, messages: string[]): Promise<string> {
    const system = 'You are a support ticket summariser. Write a concise 2–3 sentence summary of the following support ticket thread. Focus on the issue and current status.';
    const input = `Title: ${title}\nDescription: ${description}\n\nMessages:\n${messages.join('\n')}`;
    try {
      const summary = await chat(system, input);
      await prisma.aIHistory.create({
        data: { ticketId, action: 'SUMMARISE', input, output: summary, model: config.ai.model },
      });
      // Persist summary on ticket
      await prisma.ticket.update({ where: { id: ticketId }, data: { aiSummary: summary } });
      return summary;
    } catch (err) {
      logger.warn('AI summarisation failed:', err);
      return '';
    }
  },

  /** Draft a reply for an agent given the ticket context */
  async draftReply(
    ticketId: string,
    title: string,
    description: string,
    messages: string[],
    tone: 'FRIENDLY' | 'PROFESSIONAL' | 'TECHNICAL' | 'EMPATHETIC' = 'PROFESSIONAL'
  ): Promise<string> {
    const system = `You are a ${tone.toLowerCase()} customer support agent. Draft a helpful reply to this support ticket. Be concise and clear. Do not use placeholder text.`;
    const input = `Title: ${title}\nOriginal issue: ${description}\n\nPrevious messages:\n${messages.join('\n')}`;
    try {
      const draft = await chat(system, input);
      await prisma.aIHistory.create({
        data: { ticketId, action: 'DRAFT_REPLY', input, output: draft, model: config.ai.model, tone },
      });
      return draft;
    } catch (err) {
      logger.warn('AI draft reply failed:', err);
      return '';
    }
  },

  /** Improve grammar and tone of an agent's reply */
  async improveGrammar(ticketId: string, text: string): Promise<string> {
    const system = 'You are a professional editor. Improve the grammar, clarity and professional tone of the following customer support reply. Return ONLY the improved text, nothing else.';
    try {
      const improved = await chat(system, text);
      await prisma.aIHistory.create({
        data: { ticketId, action: 'IMPROVE_GRAMMAR', input: text, output: improved, model: config.ai.model },
      });
      return improved;
    } catch (err) {
      logger.warn('AI grammar improvement failed:', err);
      return text;
    }
  },

  /** Detect if a ticket is likely a duplicate given existing recent tickets */
  async detectDuplicate(
    title: string,
    description: string,
    recentTickets: { id: string; title: string; description: string }[]
  ): Promise<{ isDuplicate: boolean; similarTicketId?: string; confidence: number }> {
    if (recentTickets.length === 0) return { isDuplicate: false, confidence: 0 };
    const ticketList = recentTickets
      .map((t) => `ID:${t.id} | ${t.title}: ${t.description.substring(0, 100)}`)
      .join('\n');
    const system = `You are a duplicate ticket detector. Given a new ticket and a list of recent tickets, respond ONLY with valid JSON: {"isDuplicate":true/false,"similarTicketId":"id or null","confidence":0-100}`;
    const input = `New ticket:\nTitle: ${title}\nDescription: ${description}\n\nRecent tickets:\n${ticketList}`;
    try {
      const raw = await chat(system, input);
      return JSON.parse(raw);
    } catch {
      return { isDuplicate: false, confidence: 0 };
    }
  },

  /** Suggest whether a ticket should be auto-closed */
  async suggestAutoClose(
    _ticketId: string,
    messages: string[],
    lastActivityDaysAgo: number
  ): Promise<boolean> {
    if (messages.length === 0) return false;
    const system = 'You are a support ticket manager. Based on the ticket messages and inactivity duration, respond ONLY with true or false — should this ticket be auto-closed?';
    const input = `Days since last activity: ${lastActivityDaysAgo}\nMessages:\n${messages.join('\n')}`;
    try {
      const raw = await chat(system, input);
      return raw.toLowerCase().includes('true');
    } catch {
      return false;
    }
  },
};
