import rawData from './portfolio.json';
import type { ChatbotDocument, ChatbotPersona, ChatbotSection, LocalizedString, Project, SiteData, SocialLink } from './types';
import { buildChatbotDocuments } from '../lib/chatbot/knowledge';
import { normalizeLocalized } from '../lib/chatbot/language';

export const site = rawData as SiteData;

export const {
  meta,
  profile,
  hero,
  navigation,
  socials,
  about,
  experience,
  projects,
  education,
  skills,
  events,
  gallery,
  contact,
} = site;

export function getAllProjects(): Project[] {
  return projects.items;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.items.find((item) => item.slug === slug);
}

export function getSocialById(id: string): SocialLink | undefined {
  return socials.find((item) => item.id === id);
}

export function getHeroSocials(): SocialLink[] {
  return socials.filter((item) => ['github', 'linkedin'].includes(item.id));
}

export function getFooterSocials(): SocialLink[] {
  return socials;
}

/** Knowledge base built from portfolio.json for Gemini RAG context */
export function getChatbotDocuments(): ChatbotDocument[] {
  return buildChatbotDocuments(site);
}

export function getChatbotContext(): string {
  return getChatbotDocuments()
    .map((doc) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n');
}

export function getChatbotSection(): ChatbotSection | undefined {
  return site.chatbot;
}

const DEFAULT_CHATBOT_GREETING: LocalizedString = {
  en: '> Assistant ready. Ask me about Angel, his projects, experience, or skills.',
  es: '> Asistente listo. Pregúntame sobre Angel, sus proyectos, experiencia o habilidades.',
};

const DEFAULT_CHATBOT_FALLBACK: LocalizedString = {
  en: '> I could not find enough information in the portfolio to answer that. Try another question.',
  es: '> No encontré información suficiente en el portfolio para responder eso. Prueba con otra pregunta.',
};

const DEFAULT_CHATBOT_PERSONA: ChatbotPersona = {
  name: 'PORTFOLIO_AI',
  tone: 'terminal',
  greeting: DEFAULT_CHATBOT_GREETING,
  fallback: DEFAULT_CHATBOT_FALLBACK,
};

export function getChatbotPersona(): ChatbotPersona {
  const persona = site.chatbot?.persona;
  if (!persona) {
    return DEFAULT_CHATBOT_PERSONA;
  }

  return {
    name: persona.name,
    tone: persona.tone,
    greeting: normalizeLocalized(persona.greeting, DEFAULT_CHATBOT_GREETING),
    fallback: normalizeLocalized(persona.fallback, DEFAULT_CHATBOT_FALLBACK),
  };
}

export function isChatbotEnabled(): boolean {
  return site.chatbot?.config.enabled ?? true;
}

export type {
  SiteData,
  Project,
  ProjectDetail,
  ChatbotDocument,
  SocialLink,
} from './types';
