import type { ChatbotDocument } from '../../data/types';

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function keywordScore(query: string, document: ChatbotDocument): number {
  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery.split(' ').filter((token) => token.length > 2);
  const haystack = normalizeText(
    `${document.title} ${document.content} ${document.keywords.join(' ')}`,
  );

  let score = 0;

  for (const keyword of document.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword.length > 2 && normalizedQuery.includes(normalizedKeyword)) {
      score += 0.22;
    }
  }

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += 0.04;
    }
  }

  if (normalizedQuery.includes('angel') && haystack.includes('angel')) {
    score += 0.25;
  }

  return Math.min(score, 1);
}

function boostByIntent(query: string, document: ChatbotDocument): number {
  const normalizedQuery = normalizeText(query);

  if (
    /quien es|who is|nombre|about|presentacion|biografia/.test(normalizedQuery) &&
    (document.id === 'profile' || document.id === 'about')
  ) {
    return 0.35;
  }

  if (
    /stack|tecnolog|skill|habilidad|herramienta|tech|framework|database|base de datos|postgresql|postgres|sql/.test(
      normalizedQuery,
    ) &&
    (document.id === 'tech-catalog' ||
      document.id === 'javascript-frameworks' ||
      document.id === 'skills-overview' ||
      document.type === 'skill')
  ) {
    return 0.35;
  }

  if (/proyecto|project|app|portfolio|built|hecho|demo/.test(normalizedQuery)) {
    if (document.id === 'projects-summary' || document.type === 'project') {
      return 0.3;
    }
  }

  if (/experiencia|experience|trabajo|work|empleo|job/.test(normalizedQuery) && document.id.startsWith('experience-')) {
    return 0.25;
  }

  if (/estudi|education|universidad|school|degree/.test(normalizedQuery) && document.type === 'education') {
    return 0.25;
  }

  if (/contact|email|correo|linkedin|github|redes|social/.test(normalizedQuery) && document.type === 'contact') {
    return 0.25;
  }

  return 0;
}

export function rankDocumentsByKeywords(
  query: string,
  documents: ChatbotDocument[],
  topK = 4,
): ChatbotDocument[] {
  return documents
    .map((document) => ({
      document,
      score: keywordScore(query, document) + boostByIntent(query, document),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
    .filter((entry) => entry.score > 0.05)
    .map((entry) => entry.document);
}
