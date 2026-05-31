import figlet from 'figlet';

const FONT = 'Small';

/** Converts a project title (e.g. NEON_VIZ_ENGINE) into terminal ASCII art. */
export function generateAsciiTitle(title: string): string[] {
  const label = title.replace(/_/g, ' ').trim();

  const art = figlet.textSync(label, {
    font: FONT,
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 120,
    whitespaceBreak: true,
  });

  return art.split('\n');
}
