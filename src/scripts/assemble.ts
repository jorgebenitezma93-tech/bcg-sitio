/**
 * El logo se ensambla al hacer scroll.
 *
 * Fase 1 (hero → "El problema"): una celda de la red se separa, crece y se
 *   convierte en el isotipo, que aterriza en el hueco de la sección.
 * Fase 2 ("El problema" → "Áreas"): el isotipo se adelgaza hasta ser el
 *   hexágono del diagrama y sus tres nodos aterrizan en los nodos de las áreas.
 *
 * Todo se calcula en coordenadas de documento a partir de la posición de scroll,
 * por lo que es reversible y no depende de librerías.
 */
import { crystal } from './crystal';
import { clamp, lerp, easeInOut, rafThrottle, reducedMotion } from './env';

const BASE = 400; // tamaño base del SVG en px (se escala con transform)

interface Pt { x: number; y: number }
interface Geo { c: Pt; s: number }

const fx = document.querySelector<HTMLElement>('[data-fx]');
const hero = document.querySelector<HTMLElement>('[data-hero]');
const slot = document.querySelector<HTMLElement>('[data-logo-slot]');
const diagram = document.querySelector<HTMLElement>('[data-diagram]');

if (fx && hero && slot && diagram && !reducedMotion()) start(fx, hero, slot, diagram);

function start(fx: HTMLElement, hero: HTMLElement, slot: HTMLElement, diagram: HTMLElement) {
  const hex = fx.querySelector<SVGPolygonElement>('[data-fx-hex]')!;
  const nodes = [...fx.querySelectorAll<SVGCircleElement>('[data-fx-node]')];
  const extras = [...fx.querySelectorAll<SVGCircleElement>('[data-fx-extra]')];
  const bMark = fx.querySelector<SVGPathElement>('[data-fx-b]')!;

  document.documentElement.classList.add('fx-on');

  let start: Geo = { c: { x: 0, y: 0 }, s: 100 };
  let mid: Geo = start;
  let end: Geo = start;
  let heroBottom = 0;
  let a0 = 0, a1 = 1, b0 = 1, b1 = 2;
  let arrived = false;

  const docBox = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
  };

  function measure() {
    const vh = window.innerHeight;
    const hb = docBox(hero);
    heroBottom = hb.y + hb.h;

    // Celda de la red (si el canvas aún no calculó su panal, usa una posición razonable)
    const cell = crystal.cell;
    const cb = crystal.canvas ? docBox(crystal.canvas) : hb;
    const R = cell ? cell.R : 44;
    start = {
      c: cell ? { x: cb.x + cell.cx, y: cb.y + cell.cy } : { x: hb.x + hb.w * 0.8, y: hb.y + hb.h * 0.66 },
      s: (120 * R) / 54,
    };

    const sb = docBox(slot);
    mid = { c: { x: sb.x + sb.w / 2, y: sb.y + sb.h / 2 }, s: Math.min(sb.w, sb.h) };

    const db = docBox(diagram);
    end = { c: { x: db.x + db.w / 2, y: db.y + db.h / 2 }, s: db.w };

    a0 = vh * 0.04;
    a1 = Math.max(a0 + 220, mid.c.y - vh * 0.55);
    b0 = Math.max(a1 + vh * 0.2, mid.c.y - vh * 0.3);
    b1 = Math.max(b0 + 260, end.c.y - vh * 0.5);
    update();
  }

  const rgb = (c: number[]) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const mix = (a: number[], b: number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const IVORY = [246, 243, 238];
  const INK = [23, 37, 47];
  const COPPER_L = [201, 127, 78];
  const COPPER = [178, 104, 60];

  function update() {
    const y = window.scrollY;
    const p1 = clamp((y - a0) / (a1 - a0));
    const p2 = clamp((y - b0) / (b1 - b0));
    const e1 = easeInOut(p1);
    const e2 = easeInOut(p2);

    // geometría (centro y tamaño en px)
    let cx: number, cy: number, s: number, stroke: number;
    if (p2 > 0) {
      cx = lerp(mid.c.x, end.c.x, e2);
      cy = lerp(mid.c.y, end.c.y, e2);
      s = lerp(mid.s, end.s, e2);
      stroke = lerp(7, 0.9, e2);
    } else {
      cx = lerp(start.c.x, mid.c.x, e1);
      cy = lerp(start.c.y, mid.c.y, e1);
      s = lerp(start.s, mid.s, e1);
      stroke = lerp(1.7, 7, e1);
    }
    const k = s / BASE;
    fx.style.transform = `translate3d(${(cx - s / 2).toFixed(1)}px, ${(cy - s / 2).toFixed(1)}px, 0) scale(${k.toFixed(4)})`;

    // color: marfil sobre el hero (tinta), tinta sobre las secciones claras
    const tone = clamp((cy - heroBottom + 110) / 220);
    const line = mix(IVORY, INK, tone);
    const nodeCol = mix(COPPER_L, COPPER, tone);
    hex.setAttribute('stroke-width', stroke.toFixed(2));
    hex.style.stroke = rgb(line);
    hex.style.strokeOpacity = String(lerp(0.75, 1, e1));

    // nodos: del punto de la red al nodo del logo, y luego al nodo del diagrama
    const r = p2 > 0 ? lerp(7, 4.6, e2) : lerp(2.1, 7, e1);
    nodes.forEach((n) => {
      n.setAttribute('r', r.toFixed(2));
      n.style.fill = rgb(nodeCol);
    });
    const extraFade = 1 - clamp(p1 * 2.2);
    extras.forEach((n) => {
      n.setAttribute('r', (2.1 * extraFade).toFixed(2));
      n.style.fill = rgb(mix(IVORY, INK, tone));
      n.style.opacity = String(0.6 * extraFade);
    });

    // la B aparece al formarse el logo y se desvanece al convertirse en diagrama
    const bIn = clamp((p1 - 0.5) / 0.4);
    const bOut = 1 - clamp(p2 / 0.45);
    bMark.style.opacity = String(bIn * bOut);
    bMark.style.fill = rgb(line);

    // relevo con el diagrama real
    const nowArrived = p2 >= 0.975;
    fx.style.opacity = nowArrived ? '0' : '1';
    if (nowArrived !== arrived) {
      arrived = nowArrived;
      diagram.classList.toggle('is-arrived', arrived);
    }
  }

  // El diagrama real empieza oculto mientras el logo viaja
  diagram.classList.remove('is-arrived');

  const onScroll = rafThrottle(update);
  window.addEventListener('scroll', onScroll, { passive: true });
  const remeasure = rafThrottle(measure);
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  document.addEventListener('crystal:layout', remeasure);
  document.fonts?.ready.then(remeasure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);

  measure();
}
