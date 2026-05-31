export const MOBILE_NAV_BREAKPOINT = 768;

export interface MobileNavConfig {
  toggleId: string;
  menuId: string;
  linkSelector: string;
  breakpoint?: number;
}

export function initMobileNav(config: MobileNavConfig): void {
  const breakpoint = config.breakpoint ?? MOBILE_NAV_BREAKPOINT;
  const toggle = document.getElementById(config.toggleId);
  const menu = document.getElementById(config.menuId);

  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('flex');
    if (isOpen) {
      closeMenu();
    } else {
      menu.classList.remove('hidden');
      menu.classList.add('flex');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  menu.querySelectorAll(config.linkSelector).forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.matchMedia(`(min-width: ${breakpoint}px)`).addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
}
