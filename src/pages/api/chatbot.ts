import type { APIRoute } from 'astro';
import {
  handleChatbotRequest,
  isChatbotServiceError,
} from '../../services/chatbot';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = await handleChatbotRequest(body);

    return new Response(JSON.stringify({ ok: true, text: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (isChatbotServiceError(error)) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('[chatbot]', error);

    const message =
      import.meta.env.DEV && error instanceof Error
        ? error.message
        : 'Unexpected server error.';

    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
