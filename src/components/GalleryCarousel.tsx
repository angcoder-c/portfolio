import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { GalleryImage, GalleryItem } from '../data/types';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  images: GalleryItem[];
}

const VISIBLE_COUNT = 3;

const aspectStyles: Record<NonNullable<GalleryImage['aspect']>, string> = {
  landscape: 'h-[7rem] w-[10.5rem] sm:h-[8.5rem] sm:w-[12.5rem]',
  portrait: 'h-[8.5rem] w-[6rem] sm:h-[10.5rem] sm:w-[7.5rem]',
  square: 'h-[7rem] w-[7rem] sm:h-[8.5rem] sm:w-[8.5rem]',
};

function inferAspect(src: string): NonNullable<GalleryImage['aspect']> {
  if (src.includes('portrait')) return 'portrait';
  if (src.includes('square')) return 'square';
  return 'landscape';
}

function normalizeGallery(items: GalleryItem[]): GalleryImage[] {
  return items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        src: item,
        aspect: inferAspect(item),
        alt: `Imagen de galería ${index + 1}`,
      };
    }
    return {
      src: item.src,
      aspect: item.aspect ?? inferAspect(item.src),
      title: item.title,
      alt: item.alt ?? item.title ?? `Imagen de galería ${index + 1}`,
    };
  });
}

export default function GalleryCarousel({ images }: Props) {
  const gallery = useMemo(() => normalizeGallery(images), [images]);
  const total = gallery.length;

  const [startIndex, setStartIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const maxStart = Math.max(0, total - VISIBLE_COUNT);
  const canScroll = total > VISIBLE_COUNT;

  const visibleItems = useMemo(() => {
    if (total <= VISIBLE_COUNT) return gallery;
    return gallery.slice(startIndex, startIndex + VISIBLE_COUNT);
  }, [gallery, startIndex, total]);

  const goPrev = useCallback(() => {
    if (!canScroll) return;
    setStartIndex((current) => Math.max(0, current - 1));
  }, [canScroll]);

  const goNext = useCallback(() => {
    if (!canScroll) return;
    setStartIndex((current) => Math.min(maxStart, current + 1));
  }, [canScroll, maxStart]);

  const openModal = useCallback((index: number) => setModalIndex(index), []);
  const closeModal = useCallback(() => setModalIndex(null), []);

  const modalPrev = useCallback(() => {
    if (modalIndex === null) return;
    setModalIndex((modalIndex - 1 + total) % total);
  }, [modalIndex, total]);

  const modalNext = useCallback(() => {
    if (modalIndex === null) return;
    setModalIndex((modalIndex + 1) % total);
  }, [modalIndex, total]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) {
      return;
    }

    const animation = gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        scrollTrigger: {
          trigger: element,
          start: 'top 78%',
        },
      },
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (modalIndex !== null) {
        if (event.key === 'ArrowLeft') modalPrev();
        if (event.key === 'ArrowRight') modalNext();
        if (event.key === 'Escape') closeModal();
        return;
      }

      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalIndex, modalPrev, modalNext, closeModal, goPrev, goNext]);

  useEffect(() => {
    if (modalIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalIndex]);

  if (total === 0) {
    return <p className="text-xs text-text-muted">// ERROR: gallery buffer empty.</p>;
  }

  const modalOpen = modalIndex !== null;
  const activeItem = modalIndex !== null ? gallery[modalIndex] : null;
  const modalLabel =
    modalIndex !== null ? `IMG_${String(modalIndex + 1).padStart(3, '0')}` : '';

  const modalContent =
    modalOpen && activeItem ? (
      <div
        className="fixed inset-0 z-[10050] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`Vista ampliada: ${modalLabel}`}
      >
        <div
          className="absolute inset-0 bg-[#050805]/80 backdrop-blur-2xl"
          onClick={closeModal}
          aria-hidden="true"
        />

        <div
          className="relative z-10 w-full max-w-4xl border border-primary/35 bg-surface shadow-[0_0_60px_rgba(53,255,90,0.12)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-2.5 sm:grid-cols-[auto_1fr_auto]">
            <span className="text-[10px] font-bold tracking-wider text-text-muted">
              #MODAL_VIEW: {modalLabel}
            </span>
            {activeItem.title && (
              <span className="hidden truncate text-center text-[11px] font-bold text-primary-soft sm:block">
                {activeItem.title}
              </span>
            )}
            <button
              type="button"
              onClick={closeModal}
              className="justify-self-end border border-border px-2 py-0.5 text-[10px] font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-bg"
              aria-label="Cerrar modal"
            >
              [ ESC / CLOSE ]
            </button>
          </div>

          {activeItem.title && (
            <p className="border-b border-border/50 px-4 py-2 text-center text-[11px] font-bold text-primary sm:hidden">
              {activeItem.title}
            </p>
          )}

          <div className="flex items-center gap-3 bg-bg px-3 py-5 sm:gap-4 sm:px-5 sm:py-6">
            <button
              type="button"
              onClick={modalPrev}
              className="shrink-0 border border-border bg-surface-2 px-3 py-8 text-base font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-bg sm:px-4"
              aria-label="Imagen anterior"
            >
              {'<'}
            </button>

            <div className="flex min-h-[40vh] flex-1 items-center justify-center border border-border/60 bg-surface-2 p-3 sm:min-h-[48vh] sm:p-4">
              <img
                src={activeItem.src}
                alt={activeItem.alt ?? modalLabel}
                className="max-h-[38vh] max-w-full object-contain sm:max-h-[46vh]"
              />
            </div>

            <button
              type="button"
              onClick={modalNext}
              className="shrink-0 border border-border bg-surface-2 px-3 py-8 text-base font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-bg sm:px-4"
              aria-label="Imagen siguiente"
            >
              {'>'}
            </button>
          </div>

          <div className="border-t border-border px-4 py-2 text-center text-[10px] text-text-muted">
            {modalIndex! + 1} / {total} — flechas para navegar
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div ref={carouselRef} data-gallery-carousel className="gallery-carousel">
        <div className="border-y border-primary/25 py-4 sm:py-5">
          <div className="flex items-end justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canScroll || startIndex === 0}
              className="gallery-arrow mb-1 shrink-0 border border-primary/40 bg-surface-2 px-2.5 py-5 text-base font-bold text-primary transition-colors enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-bg disabled:border-border/40 disabled:text-text-muted/50 sm:px-3 sm:py-6 sm:text-lg"
              aria-label="Desplazar galería a la izquierda"
            >
              {'<'}
            </button>

            <div className="flex min-h-[8.5rem] flex-1 items-end justify-center gap-2.5 overflow-hidden sm:min-h-[10.5rem] sm:gap-4">
              {visibleItems.map((item, visibleOffset) => {
                const absoluteIndex =
                  total <= VISIBLE_COUNT ? visibleOffset : startIndex + visibleOffset;
                const label = `IMG_${String(absoluteIndex + 1).padStart(3, '0')}`;
                const aspect = item.aspect ?? 'landscape';

                return (
                  <button
                    key={`${item.src}-${absoluteIndex}`}
                    type="button"
                    onClick={() => openModal(absoluteIndex)}
                    className={`group relative shrink-0 overflow-hidden rounded-xl border border-primary/30 bg-surface-2 transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(53,255,90,0.18)] ${aspectStyles[aspect]}`}
                    aria-label={`Abrir ${label} en modal`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt ?? label}
                      className="size-full object-cover brightness-[0.92] contrast-[1.05] transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,22,15,0.05)_0%,rgba(15,22,15,0.35)_100%)]"
                      aria-hidden="true"
                    />
                    <span className="absolute bottom-1.5 left-1.5 border border-border/80 bg-bg/90 px-1.5 py-0.5 text-[9px] font-bold text-secondary backdrop-blur-sm">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canScroll || startIndex >= maxStart}
              className="gallery-arrow mb-1 shrink-0 border border-primary/40 bg-surface-2 px-2.5 py-5 text-base font-bold text-primary transition-colors enabled:hover:border-primary enabled:hover:bg-primary enabled:hover:text-bg disabled:border-border/40 disabled:text-text-muted/50 sm:px-3 sm:py-6 sm:text-lg"
              aria-label="Desplazar galería a la derecha"
            >
              {'>'}
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-text-muted">
          {total} archivo{total === 1 ? '' : 's'} — clic para ampliar
        </p>
      </div>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
