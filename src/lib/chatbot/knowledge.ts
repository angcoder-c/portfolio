import type { ChatbotDocument, SiteData } from '../../data/types';

const SITE_STACK = ['Astro', 'React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Node.js', 'Gemini API'];

function joinParts(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join('. ');
}

function collectTechnologies(data: SiteData): Map<string, { projects: string[]; contexts: string[] }> {
  const technologies = new Map<string, { projects: string[]; contexts: string[] }>();

  function addTech(name: string, context: string, project?: string) {
    const key = name.trim();
    if (!key) return;

    const entry = technologies.get(key) ?? { projects: [], contexts: [] };
    if (project && !entry.projects.includes(project)) {
      entry.projects.push(project);
    }
    if (!entry.contexts.includes(context)) {
      entry.contexts.push(context);
    }
    technologies.set(key, entry);
  }

  for (const tech of SITE_STACK) {
    addTech(tech, 'Portfolio personal (este sitio web)');
  }

  for (const project of data.projects.items) {
    const projectName = project.title.replace(/_/g, ' ');
    for (const tech of [...project.tech, ...project.detail.specs.stack]) {
      addTech(tech, `Proyecto ${projectName}`, projectName);
    }
  }

  for (const skill of data.skills.items) {
    for (const tech of skill.stack) {
      addTech(tech, `Habilidades: ${skill.name}`);
    }
  }

  for (const item of data.experience.items) {
    for (const tech of item.stack) {
      addTech(tech, `Experiencia: ${item.title}`);
    }
  }

  for (const item of data.education.items) {
    for (const tag of item.tags) {
      addTech(tag, `Educación: ${item.institution}`);
    }
  }

  return technologies;
}

function buildProjectsSummary(data: SiteData): string {
  return data.projects.items
    .map((project) => {
      const title = project.title.replace(/_/g, ' ');
      return `${title} (${project.status}): ${project.description} Tecnologías: ${project.tech.join(', ')}`;
    })
    .join(' | ');
}

function buildTechCatalogContent(data: SiteData): string {
  const technologies = collectTechnologies(data);

  const lines = [...technologies.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, usage]) => {
      const parts = [`- ${name}`];
      if (usage.projects.length > 0) {
        parts.push(`Proyectos: ${usage.projects.join(', ')}`);
      }
      if (usage.contexts.length > 0) {
        parts.push(`Contexto: ${usage.contexts.slice(0, 3).join('; ')}`);
      }
      return parts.join('. ');
    });

  return [
    'Catálogo completo de tecnologías que Angel ha usado según su portfolio, proyectos, experiencia, educación y este sitio web.',
    lines.join('\n'),
  ].join('\n');
}

function buildJavaScriptFrameworksContent(data: SiteData): string {
  const technologies = collectTechnologies(data);
  const frameworkNames = ['React', 'Next.js', 'Angular', 'TanStack Start', 'Astro'];

  const lines = frameworkNames.map((name) => {
    const usage = technologies.get(name) ?? [...technologies.entries()].find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
    if (!usage) {
      return `- ${name}`;
    }

    const projects =
      usage.projects.length > 0 ? `Proyectos: ${usage.projects.join(', ')}` : 'Mencionado en skills/about/portfolio';
    return `- ${name}. ${projects}`;
  });

  return joinParts([
    'Frameworks y meta-frameworks JavaScript usados por Angel según el portfolio.',
    lines.join('\n'),
    'También usa TypeScript en la mayoría de estos proyectos frontend.',
  ]);
}

export function buildChatbotDocuments(data: SiteData): ChatbotDocument[] {
  const documents: ChatbotDocument[] = [];

  documents.push({
    id: 'profile',
    type: 'profile',
    title: 'Perfil personal / Personal profile',
    content: joinParts([
      `${data.profile.name} es ${data.profile.role}`,
      `${data.profile.name} is a ${data.profile.role}`,
      `Ubicación / Location: ${data.profile.location}`,
      `Correo / Email: ${data.profile.email}`,
      `Usuario / Username: ${data.profile.username}`,
      data.hero.tagline,
    ]),
    keywords: [
      'perfil',
      'profile',
      'nombre',
      'name',
      'angel',
      'chavez',
      'quien es',
      'who is',
      'contacto',
      'email',
      'ubicacion',
      'location',
      'rol',
      'role',
      'developer',
      'desarrollador',
    ],
  });

  documents.push({
    id: 'about',
    type: 'about',
    title: 'Sobre mi / About me',
    content: data.about.text,
    keywords: ['about', 'sobre mi', 'biografia', 'presentacion', 'intereses', 'background'],
  });

  documents.push({
    id: 'projects-summary',
    type: 'project',
    title: 'Resumen de todos los proyectos / All projects summary',
    content: buildProjectsSummary(data),
    keywords: [
      'proyectos',
      'projects',
      'portfolio',
      'apps',
      'aplicaciones',
      'built',
      'hecho',
      'demo',
      'repositorio',
      'github',
    ],
  });

  documents.push({
    id: 'tech-catalog',
    type: 'faq',
    title: 'Catálogo de tecnologías / Technology catalog',
    content: buildTechCatalogContent(data),
    keywords: [
      'tecnologias',
      'technologies',
      'tech',
      'stack',
      'tools',
      'herramientas',
      'lenguajes',
      'languages',
      'astro',
      'react',
      'angular',
      'typescript',
      'javascript',
      'node',
      'docker',
      'postgresql',
      'framework',
      'frameworks',
      'ha usado',
      'has used',
    ],
  });

  documents.push({
    id: 'javascript-frameworks',
    type: 'skill',
    title: 'Frameworks JavaScript / JavaScript frameworks',
    content: buildJavaScriptFrameworksContent(data),
    keywords: [
      'javascript',
      'js',
      'framework',
      'frameworks',
      'frontend',
      'react',
      'angular',
      'next.js',
      'tanstack start',
      'meta-framework',
    ],
  });

  for (const item of data.experience.items) {
    documents.push({
      id: `experience-${item.id}`,
      type: 'about',
      title: `Experiencia / Experience: ${item.title}`,
      content: joinParts([
        `${item.title} en ${item.company ?? 'empresa no especificada'}`,
        `Periodo: ${item.period}`,
        ...item.highlights,
        `Stack: ${item.stack.join(', ')}`,
      ]),
      keywords: ['experiencia', 'experience', 'trabajo', 'work', 'empleo', 'job', item.title.toLowerCase(), item.company?.toLowerCase() ?? ''],
      metadata: { period: item.period },
    });
  }

  for (const project of data.projects.items) {
    const featureText = project.detail.features
      .map((feature) => `${feature.title}: ${feature.description}`)
      .join(' ');

    documents.push({
      id: `project-${project.slug}`,
      type: 'project',
      title: `Proyecto / Project: ${project.title}`,
      content: joinParts([
        project.description,
        `Estado / Status: ${project.status}`,
        `Tecnologías / Technologies: ${project.tech.join(', ')}`,
        `Stack detallado / Detailed stack: ${project.detail.specs.stack.join(', ')}`,
        `Rol / Role: ${project.detail.specs.role}`,
        `Categoría / Category: ${project.detail.specs.category}`,
        `Año / Year: ${project.detail.specs.year}`,
        featureText,
        project.detail.liveUrl ? `Demo: ${project.detail.liveUrl}` : null,
        project.detail.repositoryUrl ? `Repositorio / Repository: ${project.detail.repositoryUrl}` : null,
      ]),
      keywords: [
        'proyecto',
        'project',
        project.slug,
        project.title.toLowerCase(),
        ...project.tech.map((tech) => tech.toLowerCase()),
        ...project.detail.specs.stack.map((tech) => tech.toLowerCase()),
      ],
      metadata: { slug: project.slug, status: project.status },
    });
  }

  for (const item of data.education.items) {
    documents.push({
      id: `education-${item.id}`,
      type: 'education',
      title: `Educación / Education: ${item.institution}`,
      content: joinParts([
        `${item.degree} en ${item.institution}`,
        `Periodo: ${item.period}`,
        `Estado: ${item.status}`,
        `Temas: ${item.tags.join(', ')}`,
      ]),
      keywords: ['educacion', 'education', 'estudios', 'universidad', 'school', 'certificacion', item.institution.toLowerCase()],
      metadata: { status: item.status },
    });
  }

  for (const skill of data.skills.items) {
    documents.push({
      id: `skill-${skill.id}`,
      type: 'skill',
      title: `Habilidad / Skill: ${skill.name}`,
      content: joinParts([
        `${skill.name} con nivel ${skill.level}%`,
        `${skill.name} level ${skill.level}%`,
        `Tecnologías / Technologies: ${skill.stack.join(', ')}`,
      ]),
      keywords: [
        'skills',
        'habilidades',
        'stack',
        'tech stack',
        'main stack',
        'stack principal',
        'tecnologias',
        'technologies',
        skill.name.toLowerCase(),
        ...skill.stack.map((item) => item.toLowerCase()),
      ],
      metadata: { level: String(skill.level) },
    });
  }

  documents.push({
    id: 'skills-overview',
    type: 'skill',
    title: 'Stack principal y habilidades / Main tech stack and skills',
    content: data.skills.items
      .map((skill) => `${skill.name} (${skill.level}%): ${skill.stack.join(', ')}`)
      .join('. '),
    keywords: [
      'stack',
      'tech stack',
      'main stack',
      'stack principal',
      'skills',
      'habilidades',
      'tecnologias',
      'technologies',
      'frontend',
      'backend',
      'devops',
      'react',
      'angular',
      'typescript',
      'postgresql',
    ],
  });

  for (const event of data.events) {
    documents.push({
      id: `event-${event.id}`,
      type: 'faq',
      title: `Evento / Event: ${event.title}`,
      content: joinParts([`${event.title} (${event.date})`, event.description]),
      keywords: ['eventos', 'events', 'conferencias', 'hackathon', event.title.toLowerCase()],
      metadata: { date: event.date },
    });
  }

  documents.push({
    id: 'socials',
    type: 'contact',
    title: 'Redes sociales / Social links',
    content: data.socials.map((social) => `${social.label}: ${social.href}`).join('. '),
    keywords: ['github', 'linkedin', 'twitter', 'redes', 'social'],
  });

  documents.push({
    id: 'contact',
    type: 'contact',
    title: 'Contacto / Contact',
    content: joinParts([
      `Puedes contactar a ${data.profile.name} en ${data.profile.email}`,
      `You can contact ${data.profile.name} at ${data.profile.email}`,
      'También puedes usar el formulario de contacto del portfolio / You can also use the portfolio contact form',
    ]),
    keywords: ['contacto', 'contact', 'email', 'mensaje', 'message', 'escribir', 'reach'],
  });

  if (data.chatbot?.documents?.length) {
    documents.push(...data.chatbot.documents);
  }

  return documents;
}
