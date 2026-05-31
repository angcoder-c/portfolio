export interface SiteMeta {
  version: string;
  locale: string;
  lastUpdated: string;
}

export interface Profile {
  username: string;
  email: string;
  name: string;
  role: string;
  location: string;
  avatarUrl: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  terminalLabel: string;
}

export interface Hero {
  command: string;
  tagline: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface AboutSection {
  windowId?: string;
  bioWindowId?: string;
  command: string;
  text: string;
  portraitCaption?: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  title: string;
  company?: string;
  highlights: string[];
  stack: string[];
}

export interface ExperienceSection {
  windowId: string;
  command: string;
  items: ExperienceItem[];
}

export interface ProjectSpecs {
  role: string;
  stack: string[];
  status: string;
  year: string;
  category: string;
  scope: string;
}

export interface ProjectFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ProjectMedia {
  imageId: string;
  previewMode: string;
  alt: string;
  videoUrl?: string | null;
}

export interface ProjectDetail {
  projectId: string;
  systemStatus: string;
  terminalCommand: string;
  media: ProjectMedia;
  specs: ProjectSpecs;
  features: ProjectFeature[];
  liveUrl: string | null;
  repositoryUrl: string | null;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  image: string;
  tech: string[];
  status: string;
  url: string;
  detail: ProjectDetail;
}

export interface ProjectsSection {
  windowId?: string;
  command: string;
  items: Project[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  status: string;
  tags: string[];
  certificationUrls?: string[];
}

export interface EducationSection {
  windowId?: string;
  command: string;
  items: EducationItem[];
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
  stack: string[];
}

export interface SkillsSection {
  windowId?: string;
  command: string;
  items: SkillItem[];
}

export interface EventItem {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface GalleryImage {
  src: string;
  aspect?: 'landscape' | 'portrait' | 'square';
  title?: string;
  alt?: string;
}

export type GalleryItem = string | GalleryImage;

export interface ContactField {
  label: string;
  type: string;
  name: string;
}

export interface ContactMessages {
  success: string;
  error: string;
  sending: string;
}

export interface ContactSection {
  windowId?: string;
  command: string;
  fields: ContactField[];
  submitLabel: string;
  messages: ContactMessages;
}

export interface FooterSection {
  sessionEnd: string;
}

/** Document chunk for future transformers.js RAG / Q&A */
export interface ChatbotDocument {
  id: string;
  type: 'profile' | 'about' | 'project' | 'education' | 'skill' | 'contact' | 'faq';
  title: string;
  content: string;
  keywords: string[];
  metadata?: Record<string, string>;
}

export interface ChatbotPersona {
  name: string;
  tone: string;
  greeting: string;
  fallback: string;
}

export interface ChatbotConfig {
  enabled: boolean;
  model: string | null;
  maxTokens: number;
}

export interface ChatbotSection {
  config: ChatbotConfig;
  persona: ChatbotPersona;
  documents: ChatbotDocument[];
}

export interface SiteData {
  meta: SiteMeta;
  profile: Profile;
  hero: Hero;
  navigation: NavItem[];
  socials: SocialLink[];
  about: AboutSection;
  experience: ExperienceSection;
  projects: ProjectsSection;
  education: EducationSection;
  skills: SkillsSection;
  events: EventItem[];
  gallery: GalleryItem[];
  contact: ContactSection;
  footer?: FooterSection;
  chatbot?: ChatbotSection;
}
