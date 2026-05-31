import { useState, type FormEvent } from 'react';
import type { ContactSection } from '../data/types';

interface Props {
  contact: ContactSection;
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm({ contact }: Props) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    };

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? contact.messages.error);
      }

      setStatus('success');
      form.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : contact.messages.error);
    }
  }

  const isSending = status === 'sending';

  return (
    <form
      onSubmit={handleSubmit}
      className="transition-opacity data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-70"
      data-disabled={isSending}
      noValidate
    >
      <p className="mb-6 font-bold text-primary">{contact.command}</p>

      {contact.fields.map((field) => (
        <div className="mb-3" key={field.name}>
          <label htmlFor={field.name} className="mb-1 block text-text-muted">
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              required
              disabled={isSending}
              className="min-h-20 w-full resize-y border border-border/50 bg-transparent px-3 py-2 font-terminal text-sm text-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_6px_rgba(53,255,90,0.25)] disabled:opacity-60"
            />
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              required
              disabled={isSending}
              className="w-full border border-border/50 bg-transparent px-3 py-2 font-terminal text-sm text-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_6px_rgba(53,255,90,0.25)] disabled:opacity-60"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSending}
        className="mt-4 w-full cursor-pointer border border-border bg-transparent px-4 py-3.5 font-terminal text-sm font-bold tracking-wide text-text transition-colors hover:border-primary hover:bg-primary hover:text-bg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? contact.messages.sending : contact.submitLabel}
      </button>

      {status === 'success' && (
        <p className="mt-4 text-sm text-success" role="status">
          {contact.messages.success}
        </p>
      )}

      {status === 'error' && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
