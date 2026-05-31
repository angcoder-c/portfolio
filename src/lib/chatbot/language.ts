import type { LocalizedString } from '../../data/types';

export type ChatLanguage = 'es' | 'en';

const SPANISH_PATTERN =
  /\b(qu[eé]|cu[aá]l|cu[aá]les|d[oó]nde|c[oó]mo|qui[eé]n|porqu[eé]|por qu[eé]|hola|gracias|proyectos|habilidades|experiencia|estudios|contacto|trabajo|stack|cu[aá]ntos|cu[aá]ntas|tienes|tiene|eres|est[aá]s)\b/i;

export function detectLanguage(text: string): ChatLanguage {
  if (/[áéíóúñ¿¡]/i.test(text) || SPANISH_PATTERN.test(text)) {
    return 'es';
  }

  return 'en';
}

export function normalizeLocalized(
  value: string | LocalizedString | undefined,
  defaults: LocalizedString,
): LocalizedString {
  if (!value) {
    return defaults;
  }

  if (typeof value === 'string') {
    return { es: value, en: value };
  }

  return value;
}

export function resolveLocalized(
  value: string | LocalizedString,
  language: ChatLanguage,
): string {
  if (typeof value === 'string') {
    return value;
  }

  return value[language];
}

export function formatBilingual(value: LocalizedString | undefined, defaults?: LocalizedString): string {
  const resolved = value ?? defaults ?? { en: '', es: '' };
  return `${resolved.en}\n${resolved.es}`.trim();
}
