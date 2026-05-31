import type { ChatbotDocument, SiteData } from '../../data/types';
import { detectLanguage } from './language';
import { rankDocumentsByKeywords } from './retrieval';

const SITE_STACK = ['Astro', 'React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Node.js', 'Gemini API'];

function truncate(text: string, maxLength: number): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 3).trim()}...`;
}

function buildCompactPortfolioOverview(data: SiteData): string {
  const skills = data.skills.items
    .map((skill) => `${skill.name}: ${skill.stack.join(', ')}`)
    .join(' | ');

  const projects = data.projects.items
    .map(
      (project) =>
        `${project.title.replace(/_/g, ' ')} [${project.status}] -> ${project.tech.join(', ')}`,
    )
    .join(' | ');

  const experience = data.experience.items
    .map((item) => `${item.title} @ ${item.company ?? 'N/A'} (${item.period})`)
    .join(' | ');

  const education = data.education.items
    .map((item) => `${item.degree} @ ${item.institution} (${item.period})`)
    .join(' | ');

  return [
    `${data.profile.name} | ${data.profile.role} | ${data.profile.location} | ${data.profile.email}`,
    `About: ${truncate(data.about.text, 220)}`,
    `Skills: ${skills}`,
    `Experience: ${experience}`,
    `Projects: ${projects}`,
    `Education: ${education}`,
    `Portfolio site stack: ${SITE_STACK.join(', ')}`,
  ].join('\n');
}

export function buildSystemPrompt(data: SiteData, personaName: string): string {
  return [
    `You are ${personaName}, assistant for Angel Chavez's portfolio.`,
    'Answer ONLY from the portfolio data below and the retrieved context in the latest user message.',
    "Reply in the user's language (English or Spanish). Be concise and accurate.",
    'If the portfolio does not mention something, clearly say you do not have that information.',
    'Do not invent technologies, companies, or projects.',
    '',
    'PORTFOLIO DATA:',
    buildCompactPortfolioOverview(data),
  ].join('\n');
}

export function buildQuestionContext(question: string, documents: ChatbotDocument[]): string {
  const ranked = rankDocumentsByKeywords(question, documents, 2);

  if (ranked.length === 0) {
    return question;
  }

  const chunks = ranked
    .map((document) => `[${document.title}]\n${truncate(document.content, 280)}`)
    .join('\n\n');

  const language = detectLanguage(question);
  const label = language === 'en' ? 'Retrieved context' : 'Contexto recuperado';

  return `${label}:\n${chunks}\n\nQuestion / Pregunta: ${question}`;
}
