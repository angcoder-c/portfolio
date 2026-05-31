import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { ChatbotPersona } from '../data/types';
import { resolveLocalized } from '../lib/chatbot/language';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  persona: ChatbotPersona;
  enabled?: boolean;
}

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export default function PortfolioChatbot({ persona, enabled = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isThinking) {
      return;
    }

    setInput('');
    setIsThinking(true);
    setErrorMessage('');

    const nextMessages = [...messages, createMessage('user', trimmed)];
    setMessages(nextMessages);

    const history = nextMessages
      .slice(0, -1)
      .filter((message) => !message.content.startsWith('> generando'))
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history,
          personaName: persona.name,
        }),
      });

      const result = (await response.json()) as { ok?: boolean; text?: string; error?: string };

      if (!response.ok || !result.ok || !result.text) {
        throw new Error(result.error ?? resolveLocalized(persona.fallback, 'es'));
      }

      setMessages((current) => [...current, createMessage('assistant', result.text)]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : resolveLocalized(persona.fallback, 'es');

      setErrorMessage(message);
      setMessages((current) => [...current, createMessage('assistant', message)]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion(input);
    }
  }

  if (!enabled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed right-4 bottom-4 z-9997 flex h-14 w-14 items-center justify-center border border-primary bg-surface font-terminal text-xs font-bold text-primary shadow-[0_0_18px_rgba(53,255,90,0.25)] transition-colors hover:bg-primary hover:text-bg"
        aria-expanded={isOpen}
        aria-controls="portfolio-chatbot-panel"
        aria-label={isOpen ? 'Cerrar asistente del portfolio' : 'Abrir asistente del portfolio'}
      >
        {isOpen ? 'X' : 'AI'}
      </button>

      {isOpen && (
        <section
          id="portfolio-chatbot-panel"
          className="fixed right-4 bottom-20 z-9997 flex h-[min(70vh,560px)] w-[min(calc(100vw-2rem),420px)] flex-col border border-border bg-surface shadow-[0_0_24px_rgba(0,0,0,0.45)]"
          aria-label="Asistente del portfolio"
        >
          <header className="border-b border-border px-4 py-3">
            <p className="font-bold text-primary">$ ./assistant --gemini</p>
            <p className="text-xs text-text-muted">
              {persona.name} · Gemini Flash · EN/ES
            </p>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ml-8 border border-border/60 bg-surface-2 px-3 py-2 text-sm text-secondary'
                    : 'mr-4 border border-border/60 bg-surface-3 px-3 py-2 text-sm leading-relaxed text-text'
                }
              >
                <p className="mb-1 text-[10px] tracking-wide text-text-muted uppercase">
                  {message.role === 'user' ? 'usuario@terminal' : persona.name}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}

            {isThinking && (
              <div className="mr-4 border border-border/60 bg-surface-3 px-3 py-2 text-sm text-text-muted">
                <p className="mb-1 text-[10px] tracking-wide uppercase">{persona.name}</p>
                <p>&gt; generando respuesta...</p>
              </div>
            )}

            {errorMessage && !isThinking && (
              <div className="mr-4 border border-danger/40 bg-surface-3 px-3 py-2 text-sm text-danger">
                <p className="mb-1 text-[10px] tracking-wide uppercase">error</p>
                <p>{errorMessage}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3">
            <label htmlFor="portfolio-chat-input" className="mb-2 block text-xs text-text-muted">
              Ask your question / Ingresa tu pregunta:
            </label>
            <div className="flex gap-2">
              <input
                id="portfolio-chat-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={isThinking}
                placeholder="e.g. What databases has he used? / ¿Qué bases de datos ha usado?"
                className="min-w-0 flex-1 border border-border/50 bg-transparent px-3 py-2 font-terminal text-sm text-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_6px_rgba(53,255,90,0.25)] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="shrink-0 border border-border px-3 py-2 font-terminal text-xs font-bold text-text transition-colors hover:border-primary hover:bg-primary hover:text-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                ENVIAR
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
