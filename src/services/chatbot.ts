import { config as loadEnv } from 'dotenv';
import { getSecret } from 'astro:env/server';
import { site } from '../data';
import { buildChatbotDocuments } from '../lib/chatbot/knowledge';
import { buildQuestionContext, buildSystemPrompt } from '../lib/chatbot/context';

loadEnv();

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-flash-latest';
const MAX_HISTORY_TURNS = 6;

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotRequest {
  question: string;
  history?: ChatHistoryMessage[];
  personaName?: string;
}

export class ChatbotServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ChatbotServiceError';
    this.status = status;
  }
}

export function isChatbotServiceError(error: unknown): error is ChatbotServiceError {
  return (
    error instanceof Error &&
    error.name === 'ChatbotServiceError' &&
    typeof (error as ChatbotServiceError).status === 'number'
  );
}

function requireSecret(key: string): string {
  const value = getSecret(key);
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ChatbotServiceError(
      `Missing server configuration: ${key}. Add it to your .env file and restart the server.`,
      500,
    );
  }

  return value.trim();
}

function getOptionalSecret(key: string): string | undefined {
  const value = getSecret(key);
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  return value.trim();
}

function getGeminiModel(): string {
  return getOptionalSecret('GEMINI_MODEL') ?? DEFAULT_MODEL;
}

function validateRequest(data: unknown): ChatbotRequest {
  if (!data || typeof data !== 'object') {
    throw new ChatbotServiceError('Invalid request body.');
  }

  const record = data as Record<string, unknown>;
  const question = typeof record.question === 'string' ? record.question.trim() : '';
  const personaName =
    typeof record.personaName === 'string' && record.personaName.trim()
      ? record.personaName.trim()
      : 'PORTFOLIO_AI';

  if (question.length < 2 || question.length > 1000) {
    throw new ChatbotServiceError('Question must be between 2 and 1000 characters.');
  }

  let history: ChatHistoryMessage[] = [];

  if (Array.isArray(record.history)) {
    history = record.history
      .filter(
        (entry): entry is ChatHistoryMessage =>
          !!entry &&
          typeof entry === 'object' &&
          (entry as ChatHistoryMessage).role !== undefined &&
          ((entry as ChatHistoryMessage).role === 'user' ||
            (entry as ChatHistoryMessage).role === 'assistant') &&
          typeof (entry as ChatHistoryMessage).content === 'string' &&
          (entry as ChatHistoryMessage).content.trim().length > 0,
      )
      .slice(-MAX_HISTORY_TURNS * 2);
  }

  return { question, history, personaName };
}

interface GeminiContent {
  role?: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message?: string;
  };
}

function getMaxOutputTokens(): number {
  return site.chatbot?.config.maxTokens ?? 2048;
}

function extractAnswerText(payload: GeminiResponse): string {
  const candidate = payload.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];

  const answer = parts
    .filter((part) => part.text && part.thought !== true)
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  if (answer) {
    return answer;
  }

  return parts
    .map((part) => part.text ?? '')
    .join('')
    .trim();
}

function toGeminiHistory(history: ChatHistoryMessage[]): GeminiContent[] {
  return history.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

export async function handleChatbotRequest(data: unknown): Promise<{ text: string }> {
  const request = validateRequest(data);
  const apiKey = requireSecret('API_KEY');
  const model = getGeminiModel();
  const documents = buildChatbotDocuments(site);
  const personaName = request.personaName ?? 'PORTFOLIO_AI';
  const systemPrompt = buildSystemPrompt(site, personaName);
  const userPrompt = buildQuestionContext(request.question, documents);

  const contents: GeminiContent[] = [
    ...toGeminiHistory(request.history ?? []),
    { role: 'user', parts: [{ text: userPrompt }] },
  ];

  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: getMaxOutputTokens(),
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new ChatbotServiceError(
      payload.error?.message ?? `Gemini request failed with status ${response.status}.`,
      response.status >= 500 ? 502 : 400,
    );
  }

  const text = extractAnswerText(payload);

  if (!text) {
    throw new ChatbotServiceError('Gemini returned an empty response.', 502);
  }

  const finishReason = payload.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    return { text: `${text}\n\n_(Respuesta truncada por límite de tokens.)_` };
  }

  return { text };
}
