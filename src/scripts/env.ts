/** Utilidades compartidas por los scripts del cliente. */

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Llama a `fn` como máximo una vez por cuadro de animación. */
export function rafThrottle<T extends unknown[]>(fn: (...args: T) => void) {
  let queued = false;
  let last: T;
  return (...args: T) => {
    last = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...last);
    });
  };
}
