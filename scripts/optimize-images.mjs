// Convierte las fotografías de /public/img (jpg/jpeg/png) a AVIF y WebP.
// Los componentes usan <picture> si encuentran las versiones optimizadas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img');
if (!fs.existsSync(dir)) process.exit(0);

let n = 0;
for (const file of fs.readdirSync(dir)) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
  const base = path.join(dir, path.basename(file, ext));
  const img = sharp(path.join(dir, file)).rotate().resize({ width: 1200, withoutEnlargement: true });
  await img.clone().webp({ quality: 78 }).toFile(base + '.webp');
  await img.clone().avif({ quality: 55 }).toFile(base + '.avif');
  n++;
}
console.log(n ? `✔ ${n} imagen(es) optimizada(s) a AVIF/WebP` : '· Sin imágenes que optimizar en public/img');
