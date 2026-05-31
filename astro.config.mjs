// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react()],
  env: {
    schema: {
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', default: 'smtp.gmail.com' }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 587 }),
      SMTP_USER: envField.string({ context: 'server', access: 'secret' }),
      SMTP_PASS: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret' }),
      API_KEY: envField.string({ context: 'server', access: 'secret' }),
      NAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      PROJECT_NAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      PROJECT_NUMBER: envField.string({ context: 'server', access: 'secret', optional: true }),
      GEMINI_MODEL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'gemini-flash-latest',
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
