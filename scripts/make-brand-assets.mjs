// Genera los activos de marca derivados del isotipo:
//   - src/data/brand.ts       (trazo vectorial de la "B" de Spectral 600)
//   - public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png
//   - public/og-image.png     (1200 × 630, fondo tinta, logo invertido)
// Se ejecuta automáticamente antes de "npm run build".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontFile = (pkg, name) => path.join(root, 'node_modules', '@fontsource', pkg, 'files', name);
const load = (file) => {
  const b = fs.readFileSync(file);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};

const spectral600 = load(fontFile('spectral', 'spectral-latin-600-normal.woff'));
const spectral400 = load(fontFile('spectral', 'spectral-latin-400-normal.woff'));
const archivo500 = load(fontFile('archivo', 'archivo-latin-500-normal.woff'));

const C = {
  ink: '#17252F',
  copper: '#B2683C',
  copperLight: '#C97F4E',
  ivory: '#F6F3EE',
  ivoryDim: '#D9D2C7',
};

// ---- Glifo "B" centrado en el hexágono (viewBox 120 × 120) -----------------
const bb = spectral600.getPath('B', 0, 0, 64).getBoundingBox();
const bx = 60 - (bb.x1 + bb.x2) / 2;
const by = 61 - (bb.y1 + bb.y2) / 2;
const B_PATH = spectral600.getPath('B', bx, by, 64).toPathData(2);

fs.mkdirSync(path.join(root, 'src', 'data'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'src', 'data', 'brand.ts'),
  `// Archivo generado por scripts/make-brand-assets.mjs — no editar a mano.
// Trazo vectorial de la "B" (Spectral 600) centrada en un viewBox de 120 × 120.
export const B_PATH = '${B_PATH}';
export const HEX_POINTS = '114,60 87,106.77 33,106.77 6,60 33,13.23 87,13.23';
export const NODES: ReadonlyArray<readonly [number, number]> = [
  [114, 60],
  [33, 13.23],
  [33, 106.77],
];
`
);

// ---- Isotipo como SVG ------------------------------------------------------
const mark = ({ stroke, node, id = '' }) => `
  <polygon points="114,60 87,106.77 33,106.77 6,60 33,13.23 87,13.23" fill="none" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"/>
  <circle cx="114" cy="60" r="7" fill="${node}"/>
  <circle cx="33" cy="13.23" r="7" fill="${node}"/>
  <circle cx="33" cy="106.77" r="7" fill="${node}"/>
  <path d="${B_PATH}" fill="${stroke}"/>`;

// favicon.svg: se adapta al modo oscuro del navegador.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <style>
    .s{stroke:${C.ink}} .f{fill:${C.ink}} .n{fill:${C.copper}}
    @media (prefers-color-scheme: dark){.s{stroke:${C.ivory}} .f{fill:${C.ivory}} .n{fill:${C.copperLight}}}
  </style>
  <polygon class="s" points="114,60 87,106.77 33,106.77 6,60 33,13.23 87,13.23" fill="none" stroke-width="8" stroke-linejoin="round"/>
  <circle class="n" cx="114" cy="60" r="8"/>
  <circle class="n" cx="33" cy="13.23" r="8"/>
  <circle class="n" cx="33" cy="106.77" r="8"/>
  <path class="f" d="${B_PATH}"/>
</svg>
`;
fs.writeFileSync(path.join(root, 'public', 'favicon.svg'), faviconSvg);

// ---- favicon.ico (PNG de 48 px incrustado) y apple-touch-icon --------------
const iconSvg = (size, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="${bg}"/>
  <g transform="translate(60 60) scale(0.74) translate(-60 -60)">${mark({ stroke: C.ivory, node: C.copperLight })}</g>
</svg>`;

const png48 = await sharp(Buffer.from(faviconSvg), { density: 384 })
  .resize(48, 48)
  .png()
  .toBuffer();
const ico = Buffer.alloc(22 + png48.length);
ico.writeUInt16LE(0, 0); // reservado
ico.writeUInt16LE(1, 2); // tipo: icono
ico.writeUInt16LE(1, 4); // imágenes
ico.writeUInt8(48, 6);
ico.writeUInt8(48, 7);
ico.writeUInt8(0, 8);
ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png48.length, 14);
ico.writeUInt32LE(22, 18);
png48.copy(ico, 22);
fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), ico);

await sharp(Buffer.from(iconSvg(180, C.ink))).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));

// ---- Texto como trazos (no depende de fuentes instaladas) -------------------
function textPath(font, text, x, y, size, spacing = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  let cx = x;
  let d = '';
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale;
    cx += adv + spacing;
  });
  return { d, width: cx - x - spacing };
}

// ---- Imagen Open Graph 1200 × 630 ------------------------------------------
function honeycomb(w, h, R) {
  const edges = new Set();
  const key = (x, y) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
  const pts = new Map();
  let d = '';
  for (let col = -1; col * 1.5 * R < w + 2 * R; col++) {
    for (let row = -1; row * Math.sqrt(3) * R < h + 2 * R; row++) {
      const cx = col * 1.5 * R;
      const cy = row * Math.sqrt(3) * R + (col & 1 ? (Math.sqrt(3) * R) / 2 : 0);
      const v = [0, 1, 2, 3, 4, 5].map((k) => [cx + R * Math.cos((k * Math.PI) / 3), cy + R * Math.sin((k * Math.PI) / 3)]);
      for (let k = 0; k < 6; k++) {
        const a = v[k];
        const b = v[(k + 1) % 6];
        const ka = key(...a);
        const kb = key(...b);
        pts.set(ka, a);
        pts.set(kb, b);
        const ek = ka < kb ? ka + '|' + kb : kb + '|' + ka;
        if (!edges.has(ek)) {
          edges.add(ek);
          d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
        }
      }
    }
  }
  return { d, pts: [...pts.values()] };
}

const lattice = honeycomb(1200, 630, 46);
const dots = lattice.pts
  .filter(([x, y]) => x > 560 && x < 1220 && y > -10 && y < 640)
  .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 11 === 0 ? 3.2 : 1.8}" fill="${i % 11 === 0 ? C.copperLight : C.ivory}" opacity="${i % 11 === 0 ? 0.9 : 0.35}"/>`)
  .join('');

const word = textPath(spectral600, 'BENÍTEZ', 0, 0, 78, 78 * 0.04);
const sub = textPath(archivo500, 'CONSULTING GROUP', 0, 0, 26, 26 * 0.38);
const tag1 = textPath(spectral400, 'Convertimos conocimiento especializado', 0, 0, 40);
const tag2 = textPath(spectral400, 'en decisiones acertadas.', 0, 0, 40);

const markScale = 1.95;
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${C.ink}" stop-opacity="1"/>
      <stop offset="0.55" stop-color="${C.ink}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${C.ink}"/>
  <path d="${lattice.d}" stroke="${C.ivory}" stroke-opacity="0.13" stroke-width="1.2" fill="none"/>
  ${dots}
  <rect width="1200" height="630" fill="url(#fade)"/>
  <g transform="translate(78 92) scale(${markScale})">${mark({ stroke: C.ivory, node: C.copperLight })}</g>
  <rect x="338" y="104" width="2" height="184" fill="${C.ivoryDim}" opacity="0.35"/>
  <path transform="translate(372 224)" d="${word.d}" fill="${C.ivory}"/>
  <path transform="translate(376 276)" d="${sub.d}" fill="${C.ivoryDim}"/>
  <path transform="translate(78 440)" d="${tag1.d}" fill="${C.ivory}"/>
  <path transform="translate(78 492)" d="${tag2.d}" fill="${C.ivory}"/>
  <rect x="78" y="548" width="56" height="3" fill="${C.copperLight}"/>
</svg>`;
await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(path.join(root, 'public', 'og-image.png'));

console.log('✔ Activos de marca generados (favicon, apple-touch-icon, og-image, brand.ts)');
