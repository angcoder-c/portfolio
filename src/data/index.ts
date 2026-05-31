import rawData from './portfolio.json';
import type { ChatbotDocument, Project, SiteData, SocialLink } from './types';

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

/** Knowledge base for future transformers.js integration */
export function getChatbotDocuments(): ChatbotDocument[] {
  return site.chatbot?.documents ?? [];
}

export function getChatbotContext(): string {
  return getChatbotDocuments()
    .map((doc) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n');
}

export type {
  SiteData,
  Project,
  ProjectDetail,
  ChatbotDocument,
  SocialLink,
} from './types';
