import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Window border draw-in
      gsap.from('[data-window]', {
        opacity: 0,
        scale: 0.98,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
      });

      // Hero tagline & photo
      gsap.from('[data-hero-tagline]', {
        opacity: 0,
        y: 12,
        duration: 0.6,
        delay: 1.2,
        ease: 'power2.out',
      });

      gsap.from('[data-hero-location]', {
        opacity: 0,
        y: 10,
        duration: 0.5,
        delay: 1.35,
        ease: 'power2.out',
      });

      gsap.from('[data-hero-socials] a', {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.1,
        delay: 1.5,
        ease: 'power2.out',
      });

      // Boot sequence typing (hero command)
      const bootLines = document.querySelectorAll('[data-type]');
      bootLines.forEach((el, i) => {
        const text = el.textContent ?? '';
        el.textContent = '';
        gsap.to(el, {
          duration: text.length * 0.025,
          delay: 0.2 + i * 0.3,
          ease: 'none',
          onUpdate() {
            const progress = this.progress();
            el.textContent = text.slice(0, Math.floor(progress * text.length));
          },
        });
      });

      // Blinking cursor
      gsap.to('.cursor', {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      });

      // Hero title reveal
      gsap.from('[data-hero-title]', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.9,
        ease: 'power3.out',
      });

      // Command prompts stagger
      gsap.from('[data-cmd]', {
        opacity: 0,
        x: -10,
        duration: 0.5,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '[data-cmd]',
          start: 'top 85%',
        },
      });

      // Experience commit history
      gsap.from('[data-experience-commit]', {
        opacity: 0,
        x: -16,
        duration: 0.45,
        stagger: 0.14,
        scrollTrigger: {
          trigger: '#experience',
          start: 'top 78%',
        },
      });

      // Education list entries
      gsap.from('[data-education-entry]', {
        opacity: 0,
        x: -16,
        duration: 0.45,
        stagger: 0.12,
        scrollTrigger: {
          trigger: '#education',
          start: 'top 78%',
        },
      });

      // Project cards
      gsap.from('[data-project-card]', {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.12,
        scrollTrigger: {
          trigger: '#projects',
          start: 'top 75%',
        },
      });

      // Skill bars fill
      document.querySelectorAll('[data-skill-bar]').forEach((bar) => {
        const level = Number(bar.getAttribute('data-level') ?? 0);
        const blocks = bar.querySelectorAll('.skill-block');
        const filledCount = Math.round((level / 100) * blocks.length);

        ScrollTrigger.create({
          trigger: bar,
          start: 'top 85%',
          onEnter() {
            blocks.forEach((block, i) => {
              if (i < filledCount) {
                gsap.delayedCall(i * 0.04, () => {
                  block.classList.add('filled');
                });
              }
            });
          },
          once: true,
        });
      });

      // Skill cards fade in
      gsap.from('[data-skill-card]', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.12,
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 75%',
        },
      });

      // Events list entries
      gsap.from('[data-event-entry]', {
        opacity: 0,
        x: -16,
        duration: 0.45,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '#events',
          start: 'top 78%',
        },
      });

      // Gallery items
      gsap.from('[data-gallery-carousel]', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top 78%',
        },
      });

      // Contact section fade
      gsap.from('#contact', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 85%',
        },
      });

      // Subtle CRT flicker
      gsap.to('.crt-overlay', {
        opacity: 0.92,
        duration: 0.08,
        repeat: -1,
        yoyo: true,
        ease: 'steps(2)',
      });

      // Nav link hover glitch
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('mouseenter', () => {
          gsap.to(link, {
            x: 2,
            duration: 0.05,
            repeat: 3,
            yoyo: true,
            ease: 'power1.inOut',
          });
        });
      });

      // Portrait glitch on hover
      const portrait = document.querySelector('[data-portrait]');
      if (portrait) {
        portrait.addEventListener('mouseenter', () => {
          gsap.to(portrait, {
            x: () => gsap.utils.random(-3, 3),
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            onComplete: () => gsap.set(portrait, { x: 0 }),
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return null;
}
