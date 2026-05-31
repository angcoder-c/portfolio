import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetailAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-project-shell]', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      const prompt = document.querySelector('[data-terminal-prompt]');
      if (prompt) {
        const text = prompt.textContent ?? '';
        prompt.textContent = '';
        gsap.to(prompt, {
          duration: text.length * 0.02,
          delay: 0.2,
          ease: 'none',
          onUpdate() {
            const progress = this.progress();
            prompt.textContent = text.slice(0, Math.floor(progress * text.length));
          },
        });
      }

      gsap.from('[data-ascii-line]', {
        opacity: 0,
        x: -8,
        duration: 0.15,
        stagger: 0.08,
        delay: 0.8,
        ease: 'power2.out',
      });

      gsap.from('[data-media-window]', {
        opacity: 0,
        scale: 0.97,
        duration: 0.6,
        delay: 1.2,
        ease: 'power3.out',
      });

      gsap.from('[data-spec-panel]', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.15,
        scrollTrigger: { trigger: '#specs', start: 'top 85%' },
      });

      gsap.from('[data-description-text]', {
        opacity: 0,
        y: 12,
        duration: 0.5,
        scrollTrigger: { trigger: '#description', start: 'top 85%' },
      });

      gsap.from('[data-feature-item]', {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.1,
        scrollTrigger: { trigger: '#features', start: 'top 85%' },
      });

      gsap.to('.cursor', {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      });

      gsap.to('.crt-overlay', {
        opacity: 0.92,
        duration: 0.08,
        repeat: -1,
        yoyo: true,
        ease: 'steps(2)',
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
