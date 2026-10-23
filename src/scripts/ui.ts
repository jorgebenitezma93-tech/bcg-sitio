/**
 * Interacciones globales: navegación, revelado al hacer scroll, contadores
 * y cursor personalizado. Todo respeta prefers-reduced-motion.
 */
import { reducedMotion, finePointer, easeOut, lerp } from './env';

const reduce = reducedMotion();

/* ---------- Navegación ---------- */
function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const toggle = nav.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const menu = nav.querySelector<HTMLElement>('[data-nav-menu]');
  const forceSolid = nav.dataset.solid === 'true';

  const onScroll = () => nav.classList.toggle('is-solid', forceSolid || window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open: boolean) => {
    nav.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle?.focus();
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setOpen(false));

  // Enlace activo según la sección visible
  const links = new Map<string, HTMLAnchorElement>();
  nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((a) => links.set(a.dataset.navLink!, a));
  if (links.size && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a, id) => {
            if (id === en.target.id) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    links.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
}

/* ---------- Revelado al entrar en pantalla ---------- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Contadores ---------- */
function initCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length || reduce || !('IntersectionObserver' in window)) return;
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const dur = 1300;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = String(Math.round(lerp(0, target, easeOut(t))));
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          run(en.target as HTMLElement);
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.6 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Cursor discreto (solo escritorio) ---------- */
function initCursor() {
  if (reduce || !finePointer()) return;
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  const loop = () => {
    x = lerp(x, tx, 0.2);
    y = lerp(y, ty, 0.2);
    ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!ring.classList.contains('is-visible')) {
        x = tx;
        y = ty;
        ring.classList.add('is-visible');
      }
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => ring.classList.remove('is-visible'));
  document.addEventListener('pointerover', (e) => {
    const hit = (e.target as Element).closest('a, button, input, select, textarea, label, summary, [data-cursor]');
    ring.classList.toggle('is-active', !!hit);
  });
}

initNav();
initReveal();
initCounters();
initCursor();
