# Benítez Consulting Group — Sitio web

Sitio institucional de **Benítez Consulting Group, S.A.S.** Astro + TypeScript, salida estática, CSS propio y JavaScript nativo (Canvas 2D para la red cristalina). Sin Tailwind, sin librerías de UI, sin cookies de rastreo ni analítica.

JavaScript total de la página de inicio: ~15 KB (el presupuesto era 200 KB).

## 1. Correr en local

Requisitos: [Node.js](https://nodejs.org) 22.22 o superior (lo exige Astro 7).

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:4321
```

Para generar la versión de producción:

```bash
npm run build      # genera la carpeta dist/
npm run preview    # sirve dist/ para revisarla
```

`npm run build` ejecuta antes dos scripts que regeneran activos: favicon, `apple-touch-icon`, imagen Open Graph (`scripts/make-brand-assets.mjs`) y la conversión de fotografías de `public/img` a AVIF/WebP (`scripts/optimize-images.mjs`).

## 2. Qué editar (sin tocar el diseño)

| Qué | Dónde |
|---|---|
| Correo, WhatsApp, LinkedIn, ciudad, horario, cifras, datos del fundador | `src/data/site.ts` |
| Clientes e instituciones | `src/data/clients.ts` |
| Áreas de práctica y servicios (las líneas económicas y financieras están en `futureAreas`, sin publicar) | `src/data/areas.ts` |
| ORCID, Google Scholar, formación y publicaciones | `src/data/publications.ts` |
| Fases del método, valores, misión y visión | `src/data/content.ts` |
| Testimonios (sección oculta) | `src/data/testimonials.ts` |
| Fotografía del fundador | `public/img/fundador.jpg` |
| Aviso de privacidad | `src/pages/aviso-de-privacidad.astro` |

**Datos de contacto.** Los campos con `REEMPLAZAR` o vacíos no se muestran en el sitio hasta que los complete. No se publica dirección física.

**Clientes.** Copie un bloque `{ name, sector, project }` en `clients.ts`. Para ocultar uno, cambie `enabled: false` o bórrelo. El campo opcional `logo` permite usar un logotipo oficial (por ejemplo `/img/clientes/anahuac.svg`); úselo solo con autorización escrita de la institución. La plantilla `[Agregar cliente]` viene desactivada.

**Testimonios.** Están preparados pero ocultos (`enabled: false`). No active la sección con textos marcador; use solo testimonios reales y autorizados.

**Fotografía.** Coloque `public/img/fundador.jpg` (proporción 4:5 recomendada). El build crea las versiones AVIF y WebP. Mientras no exista, se muestra un marcador.

## 3. Formulario de contacto

El formulario valida en el navegador (mensajes en español) y ofrece tres vías:

1. **Con Formspree (recomendado).** Cree un formulario en [formspree.io](https://formspree.io) con `jorge.benitezma93@gmail.com` como correo de destino (se define en el panel de Formspree, no en el código). Copie su endpoint (`https://formspree.io/f/XXXXXXXX`) y defínalo como variable de entorno `PUBLIC_FORM_ENDPOINT` (en un archivo `.env` local o en el panel de Cloudflare Pages). Cada mensaje llega a esa bandeja. Incluye un campo trampa (`_gotcha`) contra robots.
2. **Sin endpoint.** El botón «Enviar mensaje» abre el cliente de correo (`mailto:`) con los datos ya escritos, dirigido al correo de `site.ts`.
3. **Botón «Enviar por WhatsApp».** Abre `wa.me` con el mensaje ya escrito hacia el número de `site.ts`; la persona lo envía desde su teléfono. No es un envío automático (eso requeriría la API de WhatsApp Business). El botón se oculta si `whatsapp` está vacío.

El cuestionario «¿Por dónde empiezo?» funciona por completo en el navegador, no guarda ni envía respuestas, y al terminar preselecciona el área y el asunto del formulario.

## 4. Variables de entorno

Copie `.env.example` a `.env`:

| Variable | Uso |
|---|---|
| `SITE_URL` | URL pública definitiva (sitemap, canonical, Open Graph, JSON-LD). **Cámbiela antes de publicar**: por defecto es `https://www.example.com`. |
| `PUBLIC_FORM_ENDPOINT` | Endpoint de Formspree (opcional). |

## 5. Publicar: GitHub + Cloudflare Pages + dominio de Akky

1. **Dominio.** Compre el dominio en Akky.
2. **Cloudflare.** Cree una cuenta gratuita en [cloudflare.com](https://cloudflare.com), elija **Add a domain** y escriba su dominio. Cloudflare le da dos servidores de nombres (nameservers). En el panel de Akky, cambie los nameservers del dominio por esos dos. Confirme que Akky permita el cambio; la propagación puede tardar de minutos a unas horas.
3. **GitHub.** Suba la carpeta `sitio` a un repositorio (el `.gitignore` ya excluye `node_modules`, `dist` y `.env`).
4. **Cloudflare Pages.** En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y elija el repositorio. Configuración de construcción:
   - *Framework preset:* Astro
   - *Build command:* `npm run build`
   - *Build output directory:* `dist`
   - *Root directory:* `sitio` (solo si el repositorio contiene más carpetas)
   - *Environment variables:* `SITE_URL` (por ejemplo `https://www.sudominio.mx`), `PUBLIC_FORM_ENDPOINT` y `NODE_VERSION` = `22` (Astro 7 no compila con Node 20; el archivo `.node-version` también lo fija).
5. **Dominio en Pages.** En el proyecto: **Custom domains → Set up a custom domain**. Como el DNS ya está en Cloudflare, crea los registros y el certificado HTTPS solo.
6. Desde ahí, cada `git push` a la rama principal publica una versión nueva.

### Alternativa: Vercel

1. Suba la carpeta `sitio` a un repositorio de GitHub (el archivo `.gitignore` ya excluye `node_modules`, `dist` y `.env`).
2. En [vercel.com](https://vercel.com) elija **Add New → Project** e importe el repositorio. Vercel detecta Astro: *Build Command* `npm run build`, *Output Directory* `dist`. Si el repositorio contiene más carpetas, indique `sitio` como *Root Directory*.
3. En **Settings → Environment Variables** agregue `SITE_URL` (su dominio final, por ejemplo `https://www.sudominio.mx`) y `PUBLIC_FORM_ENDPOINT`. Vuelva a desplegar.
4. En **Settings → Domains** agregue su dominio. Vercel indica los registros DNS: normalmente un registro `A` (`76.76.21.21`) para el dominio raíz y un `CNAME` (`cname.vercel-dns.com`) para `www`. Créelos en el proveedor donde compró el dominio; la propagación puede tardar de minutos a unas horas. El certificado HTTPS es automático.

**Netlify:** el proceso es equivalente (`netlify.toml` ya define comando y carpeta de publicación). Defina las mismas variables en *Site configuration → Environment variables*.

## 6. Lista de verificación antes de publicar

- [ ] `SITE_URL` configurada con el dominio real.
- [ ] Correo, WhatsApp y (opcional) LinkedIn revisados en `src/data/site.ts`. Correo y WhatsApp ya están configurados.
- [ ] Endpoint de Formspree configurado y una prueba de envío realizada.
- [ ] **Aviso de privacidad revisado por un abogado**, con el domicilio legal completado y el recuadro de borrador eliminado.
- [ ] Fotografía del fundador en `public/img/fundador.jpg`.
- [ ] Autorización de las instituciones para mostrar su nombre (y, en su caso, su logotipo).

## 7. Marca y accesibilidad

- Paleta, tipografías (Spectral y Archivo vía Google Fonts con `display=swap`) y logo respetan la identidad de marca. El logo es un componente: `<Logo variant="positive|inverted|accent" layout="mark|horizontal|stacked" />`.
- **Una adición a la paleta:** `--copper-deep` (`#9C5630`), un tono derivado del cobre usado para texto y botones sobre fondo claro. El cobre de marca (`#B2683C`) da 3.8:1 sobre marfil y no cumple WCAG 2.1 AA para texto pequeño; este tono da 5:1. El cobre original se conserva en nodos, trazos y detalles.
- Con `prefers-reduced-motion: reduce` se desactivan las animaciones: la red cristalina se dibuja estática, el logo no viaja, las tarjetas no giran y los contadores muestran su cifra final.
- Todo es navegable con teclado, con foco visible en cobre.
- Las fuentes se cargan desde Google Fonts; el aviso de privacidad lo menciona. Si prefiere evitarlo, puede alojarlas localmente con `@fontsource`.

## 8. Estructura

```
src/
  components/   Logo, Nav, Hero, Assemble (logo viajero), Problem, Practice,
                Method, Clients, About, Quiz, Contact, Footer
  data/         site.ts · clients.ts · areas.ts · content.ts · testimonials.ts
  layouts/      Base.astro (SEO, Open Graph, JSON-LD)
  pages/        index · aviso-de-privacidad · 404 · robots.txt
  scripts/      crystal.ts (red cristalina) · assemble.ts · ui.ts · env.ts
  styles/       global.css (tokens de diseño)
scripts/        generación de favicon / OG / imágenes
public/         favicon, apple-touch-icon, og-image, img/
brand/          PNG originales del logo (referencia)
```
