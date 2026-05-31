import { config as loadEnv } from 'dotenv';
import { getSecret } from 'astro:env/server';
import nodemailer from 'nodemailer';

loadEnv();

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export class ContactServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ContactServiceError';
    this.status = status;
  }
}

export function isContactServiceError(error: unknown): error is ContactServiceError {
  return (
    error instanceof Error &&
    error.name === 'ContactServiceError' &&
    typeof (error as ContactServiceError).status === 'number'
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireSecret(key: string): string {
  const value = getSecret(key);
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContactServiceError(
      `Missing server configuration: ${key}. Check your .env file and restart the server.`,
      500,
    );
  }
  return value.trim();
}

function getSmtpPort(): number {
  const raw = getSecret('SMTP_PORT');
  const port = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? '587'), 10);
  return Number.isFinite(port) ? port : 587;
}

export function validateContactPayload(data: unknown): ContactPayload {
  if (!data || typeof data !== 'object') {
    throw new ContactServiceError('Invalid request body.');
  }

  const record = data as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const email = typeof record.email === 'string' ? record.email.trim() : '';
  const message = typeof record.message === 'string' ? record.message.trim() : '';

  if (name.length < 2 || name.length > 100) {
    throw new ContactServiceError('Name must be between 2 and 100 characters.');
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new ContactServiceError('A valid email address is required.');
  }

  if (message.length < 10 || message.length > 5000) {
    throw new ContactServiceError('Message must be between 10 and 5000 characters.');
  }

  return { name, email, message };
}

function buildMailContent(payload: ContactPayload) {
  return {
    subject: `[Portfolio] Mensaje de ${payload.name}`,
    text: [
      `Nombre: ${payload.name}`,
      `Email: ${payload.email}`,
      '',
      payload.message,
    ].join('\n'),
    html: `
      <p><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <hr />
      <p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>
    `.trim(),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const host = requireSecret('SMTP_HOST');
  const user = requireSecret('SMTP_USER');
  const pass = requireSecret('SMTP_PASS');
  const to = requireSecret('CONTACT_TO_EMAIL');
  const from = requireSecret('CONTACT_FROM_EMAIL');
  const port = getSmtpPort();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: payload.email,
      ...buildMailContent(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail delivery failed.';
    throw new ContactServiceError(`Could not send email: ${message}`, 502);
  }
}

export async function handleContactSubmission(data: unknown): Promise<ContactPayload> {
  const payload = validateContactPayload(data);
  await sendContactEmail(payload);
  return payload;
}
