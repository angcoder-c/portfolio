import { useEffect } from 'react';
import gsap from 'gsap';

const DESKTOP_MQ = '(min-width: 768px)';

export default function HeroPlanetAnimations() {
  useEffect(() => {
    const container = document.querySelector('[data-hero-planet]');
    const wrap = container?.querySelector('[data-planet-wrap]');
    if (!container || !wrap) return;

    let ctx: gsap.Context | null = null;

    const startAnimations = () => {
      if (ctx) ctx.kill();

      gsap.set(wrap, {
        rotateX: 0,
        rotateY: 0,
        rotation: 0,
        skewX: 0,
        skewY: 0,
        scale: 1,
        x: 0,
        y: 0,
        transformPerspective: 0,
      });

      ctx = gsap.context(() => {
        gsap.fromTo(
          wrap,
          { scale: 0.92 },
          { scale: 1, duration: 1.2, ease: 'power2.out' },
        );

        gsap.to(wrap, {
          y: -6,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.2,
        });

        const glow = container.querySelector('[data-planet-glow]');
        if (glow) {
          gsap.fromTo(
            glow,
            { attr: { r: 50 }, opacity: 0.4 },
            {
              attr: { r: 58 },
              opacity: 0.25,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            },
          );
        }

        const body = container.querySelector('[data-planet-body]');
        if (body) {
          gsap.fromTo(
            body,
            { attr: { r: 45 } },
            {
              attr: { r: 47 },
              duration: 2.2,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            },
          );
        }

        container.querySelectorAll('[data-orbit]').forEach((orbit) => {
          const duration = Number(orbit.getAttribute('data-duration') ?? 8);
          const direction = Number(orbit.getAttribute('data-direction') ?? 1);

          gsap.set(orbit, { rotation: 0, svgOrigin: '150 150' });
          gsap.to(orbit, {
            rotation: 360 * direction,
            duration,
            repeat: -1,
            ease: 'none',
          });
        });

        container.querySelectorAll('[data-bracket]').forEach((bracket, i) => {
          gsap.fromTo(
            bracket,
            { opacity: 0.5 },
            {
              opacity: 0.85,
              duration: 1.5,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: i * 0.1,
            },
          );
        });
      }, container);
    };

    const stopAnimations = () => {
      if (ctx) {
        ctx.kill();
        ctx = null;
      }
      gsap.killTweensOf(wrap);
      gsap.killTweensOf(container.querySelectorAll('[data-orbit], [data-planet-glow], [data-planet-body], [data-bracket]'));
      gsap.set(wrap, { clearProps: 'all' });
    };

    const mq = window.matchMedia(DESKTOP_MQ);

    const handleChange = () => {
      if (mq.matches) {
        startAnimations();
      } else {
        stopAnimations();
      }
    };

    handleChange();
    mq.addEventListener('change', handleChange);

    return () => {
      mq.removeEventListener('change', handleChange);
      stopAnimations();
    };
  }, []);

  return null;
}
