/**
 * Red cristalina viva (Canvas 2D).
 * Panal hexagonal de nodos y enlaces. El cursor (o el toque, o el scroll en
 * móvil) perturba la red como una membrana elástica: los nodos cercanos se
 * desplazan, se propagan por los enlaces y regresan a su sitio; los enlaces
 * próximos se iluminan en cobre.
 */
import { clamp, finePointer } from './env';

interface Node {
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  accent: boolean;
  delay: number;
}

/** Celda que se separa de la red para formar el logo (coordenadas del canvas). */
export interface FeatureCell {
  cx: number;
  cy: number;
  R: number;
}

export const crystal: { cell: FeatureCell | null; canvas: HTMLCanvasElement | null } = { cell: null, canvas: null };

const COL_EDGE = 'rgba(217, 210, 199, 0.115)';
const COL_NODE = 'rgba(217, 210, 199, 0.34)';
const COPPER = [201, 127, 78];

export function initCrystal(host: HTMLElement, canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  crystal.canvas = canvas;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let nodes: Node[] = [];
  let edges: [number, number][] = [];
  let adj: number[][] = [];
  let R = 40;
  let RAD = 150;

  // puntero (real o fantasma por scroll)
  let px = -9999;
  let py = -9999;
  let active = false;
  let strength = 0; // 0..1, se suaviza
  let ghostUntil = 0;

  let raf = 0;
  let running = false;
  let inView = true;
  let last = 0;
  let introStart = 0;

  /* ---------- Generación del panal ---------- */
  function build() {
    const rect = host.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    R = clamp(W / 20, 30, 52);
    RAD = clamp(W / 7, 110, 190);

    const idx = new Map<string, number>();
    nodes = [];
    edges = [];
    const edgeSet = new Set<string>();
    const centers: [number, number][] = [];
    const sqrt3 = Math.sqrt(3);
    const key = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;

    const get = (x: number, y: number) => {
      const k = key(x, y);
      let i = idx.get(k);
      if (i === undefined) {
        i = nodes.length;
        idx.set(k, i);
        // determinista: ~1 de cada 14 nodos es de cobre
        const h = (Math.imul(Math.round(x) * 73856093, 1) ^ Math.imul(Math.round(y) * 19349663, 1)) >>> 0;
        nodes.push({ x0: x, y0: y, x, y, vx: 0, vy: 0, accent: h % 14 === 0, delay: 0 });
      }
      return i;
    };

    for (let col = -1; col * 1.5 * R < W + 2 * R; col++) {
      for (let row = -1; row * sqrt3 * R < H + 2 * R; row++) {
        const cx = col * 1.5 * R;
        const cy = row * sqrt3 * R + (col & 1 ? (sqrt3 * R) / 2 : 0);
        centers.push([cx, cy]);
        const ids = [0, 1, 2, 3, 4, 5].map((k) =>
          get(cx + R * Math.cos((k * Math.PI) / 3), cy + R * Math.sin((k * Math.PI) / 3))
        );
        for (let k = 0; k < 6; k++) {
          const a = ids[k];
          const b = ids[(k + 1) % 6];
          const ek = a < b ? `${a}|${b}` : `${b}|${a}`;
          if (!edgeSet.has(ek)) {
            edgeSet.add(ek);
            edges.push([a, b]);
          }
        }
      }
    }

    adj = nodes.map(() => []);
    edges.forEach(([a, b]) => {
      adj[a].push(b);
      adj[b].push(a);
    });

    // Celda candidata para el logo: abajo a la derecha del hero
    const tx = W * (W < 700 ? 0.74 : 0.8);
    const ty = H * (W < 700 ? 0.86 : 0.66);
    let best: [number, number] = centers[0];
    let bd = Infinity;
    for (const c of centers) {
      const d = (c[0] - tx) ** 2 + (c[1] - ty) ** 2;
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    crystal.cell = { cx: best[0], cy: best[1], R };

    // Retardo de entrada: la red "crece" desde la celda destacada
    const far = Math.hypot(Math.max(best[0], W - best[0]), Math.max(best[1], H - best[1])) || 1;
    nodes.forEach((n) => (n.delay = Math.hypot(n.x0 - best[0], n.y0 - best[1]) / far));

    document.dispatchEvent(new CustomEvent('crystal:layout'));
  }

  /* ---------- Física ---------- */
  function step(dt: number, now: number) {
    const K = 0.05;
    const DAMP = Math.pow(0.88, dt);
    const KC = 0.03;
    const push = 2.4 * strength;
    const ghost = now < ghostUntil;
    const on = (active || ghost) && strength > 0.01;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      let fx = (n.x0 - n.x) * K;
      let fy = (n.y0 - n.y) * K;
      if (on) {
        const dx = n.x0 - px;
        const dy = n.y0 - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < RAD * RAD) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / RAD) ** 2 * push;
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
      }
      n.vx += fx * dt;
      n.vy += fy * dt;
    }
    // Acoplamiento elástico entre vecinos: la perturbación se propaga
    for (let e = 0; e < edges.length; e++) {
      const a = nodes[edges[e][0]];
      const b = nodes[edges[e][1]];
      const dx = a.x - a.x0 - (b.x - b.x0);
      const dy = a.y - a.y0 - (b.y - b.y0);
      a.vx -= dx * KC * dt;
      a.vy -= dy * KC * dt;
      b.vx += dx * KC * dt;
      b.vy += dy * KC * dt;
    }
    let energy = 0;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.vx *= DAMP;
      n.vy *= DAMP;
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      energy += Math.abs(n.vx) + Math.abs(n.vy) + Math.abs(n.x - n.x0) + Math.abs(n.y - n.y0);
    }
    return energy;
  }

  /* ---------- Dibujo ---------- */
  function draw(now: number) {
    const c = ctx!;
    c.clearRect(0, 0, W, H);
    const intro = reduced ? 1 : clamp((now - introStart) / 1800);
    const alphaOf = (n: Node) => (reduced ? 1 : clamp(intro * 1.7 - n.delay * 0.9));
    const on = (active || now < ghostUntil) && strength > 0.01;
    const hot = RAD * 1.1;

    // enlaces base (un solo trazo)
    c.lineWidth = 1;
    c.strokeStyle = COL_EDGE;
    c.beginPath();
    for (let e = 0; e < edges.length; e++) {
      const a = nodes[edges[e][0]];
      const b = nodes[edges[e][1]];
      if (!reduced && alphaOf(a) < 0.5) continue;
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
    }
    c.stroke();

    // enlaces iluminados
    if (on) {
      c.lineWidth = 1.5;
      for (let e = 0; e < edges.length; e++) {
        const a = nodes[edges[e][0]];
        const b = nodes[edges[e][1]];
        const mx = (a.x + b.x) / 2 - px;
        const my = (a.y + b.y) / 2 - py;
        const d = Math.sqrt(mx * mx + my * my);
        if (d > hot) continue;
        const t = (1 - d / hot) * strength;
        c.strokeStyle = `rgba(${COPPER[0]},${COPPER[1]},${COPPER[2]},${(t * 0.95).toFixed(3)})`;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }
    }

    // nodos base
    c.fillStyle = COL_NODE;
    c.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.accent || alphaOf(n) < 0.5) continue;
      c.moveTo(n.x + 1.6, n.y);
      c.arc(n.x, n.y, 1.6, 0, 6.2832);
    }
    c.fill();

    // nodos de cobre y nodos cercanos al puntero
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const al = alphaOf(n);
      if (al < 0.05) continue;
      let t = 0;
      if (on) {
        const d = Math.hypot(n.x - px, n.y - py);
        if (d < hot) t = (1 - d / hot) * strength;
      }
      if (!n.accent && t < 0.05) continue;
      const r = 1.6 + (n.accent ? 1 : 0) + t * 2.6;
      const a = Math.min(1, (n.accent ? 0.8 : 0.45) + t * 0.6) * al;
      c.fillStyle = `rgba(${COPPER[0]},${COPPER[1]},${COPPER[2]},${a.toFixed(3)})`;
      c.beginPath();
      c.arc(n.x, n.y, r, 0, 6.2832);
      c.fill();
    }
  }

  /* ---------- Bucle ---------- */
  function frame(now: number) {
    const dt = clamp((now - last) / 16.667, 0.2, 2.5);
    last = now;
    const target = active || now < ghostUntil ? 1 : 0;
    strength += (target - strength) * (target ? 0.18 : 0.08) * dt;
    const energy = step(dt, now);
    draw(now);
    const intro = clamp((now - introStart) / 1800);
    if (inView && (target || energy > 0.6 || strength > 0.01 || intro < 1)) {
      raf = requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }
  function wake() {
    if (reduced || running || !inView) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  /* ---------- Entradas ---------- */
  function setPointer(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
    active = true;
    wake();
  }
  if (!reduced) {
    host.addEventListener('pointermove', setPointer, { passive: true });
    host.addEventListener('pointerdown', setPointer, { passive: true });
    host.addEventListener('pointerleave', () => (active = false));
    host.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && setTimeout(() => (active = false), 350));
    host.addEventListener('pointercancel', () => (active = false));

    // En pantallas táctiles el scroll "barre" la red
    if (!finePointer()) {
      window.addEventListener(
        'scroll',
        () => {
          if (!inView) return;
          const r = host.getBoundingClientRect();
          const prog = clamp(-r.top / Math.max(1, r.height));
          px = W * (0.12 + 0.76 * ((window.scrollY / 420) % 1));
          py = H * (0.35 + 0.4 * prog);
          ghostUntil = performance.now() + 220;
          wake();
        },
        { passive: true }
      );
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([en]) => {
        inView = en.isIntersecting;
        if (inView) wake();
      },
      { threshold: 0 }
    ).observe(host);
  }

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      const w = Math.round(host.getBoundingClientRect().width);
      const h = Math.round(host.getBoundingClientRect().height);
      if (w === W && h === H) return;
      build();
      if (reduced) draw(performance.now());
      else {
        introStart = performance.now() - 1800;
        wake();
      }
    }, 120);
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(onResize).observe(host);
  else (window as Window).addEventListener('resize', onResize);

  build();
  introStart = performance.now();
  if (reduced) draw(introStart);
  else wake();
}
