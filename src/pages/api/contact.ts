import type { APIRoute } from 'astro';
import {
  handleContactSubmission,
  isContactServiceError,
} from '../../services/contact';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const payload = await handleContactSubmission(body);

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Message sent successfully.',
        data: { name: payload.name, email: payload.email },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (isContactServiceError(error)) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.error('[contact]', error);

    const message =
      import.meta.env.DEV && error instanceof Error
        ? error.message
        : 'Unexpected server error.';

    return new Response(
      JSON.stringify({ ok: false, error: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
