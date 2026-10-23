# Guía paso a paso para publicar el sitio

Marque cada casilla al terminar. Los nombres de botones pueden variar un poco en cada servicio; si algo no coincide, busque la opción equivalente.

## FASE 1 — Preparar el contenido (en su computadora)

- [ ] **1. Abrir una terminal en la carpeta del sitio.** En el Explorador de archivos entre a `Documentos\Benítez Consulting Group\sitio`, haga clic en la barra de direcciones, escriba `powershell` y presione Enter.
- [ ] **2. Iniciar el sitio local.** En esa terminal escriba `npm run dev` y abra `http://localhost:4321` en su navegador. (Para detenerlo: Ctrl + C.)
- [ ] **3. Poner su fotografía.** Copie su foto (vertical, proporción 4:5) a `sitio\public\img\` con el nombre exacto `fundador.jpg`. Recargue la página y verifique que aparece en «Nosotros».
- [ ] **4. Probar el formulario.** Llene el formulario con datos de prueba y envíelo. Compruebe que llega un correo a jorge.benitezma93@gmail.com (revise spam) y que aparece en formspree.io → su formulario → *Submissions*. Si Formspree pide confirmar el formulario, hágalo desde el correo que le envíe.
- [ ] **5. Probar el botón de WhatsApp.** Debe abrir WhatsApp con el mensaje ya escrito.
- [ ] **6. Revisar textos.** Lea todo el sitio. Cambie en `src/data/areas.ts` los servicios de «Asesoramiento científico» y «Asesoramiento tecnológico e ingenieril» si no reflejan lo que ofrece. Decida si ajusta la misión (`src/data/content.ts`), que aún menciona «análisis financiero y económico».
- [ ] **7. Comparar publicaciones.** Compare la lista de `src/data/publications.ts` (sale de ORCID) con su Google Scholar y agregue lo que falte.

## FASE 2 — Subir el código a GitHub

- [ ] **8. Instalar Git** (si no lo tiene): descargue el instalador de https://git-scm.com y acepte las opciones por defecto. Cierre y vuelva a abrir la terminal.
- [ ] **9. Crear cuenta en GitHub:** https://github.com → *Sign up*.
- [ ] **10. Crear el repositorio:** botón **+** (arriba a la derecha) → *New repository*. Nombre: `bcg-sitio`. Elija *Private*. **No** marque «Add a README». Pulse *Create repository*. GitHub le mostrará la dirección del repositorio, del tipo `https://github.com/SU-USUARIO/bcg-sitio.git`.
- [ ] **11. Subir el sitio.** En la terminal de la carpeta `sitio`, ejecute una línea a la vez (cambie `SU-USUARIO`):

  ```
  git init
  git add .
  git commit -m "Primera versión del sitio"
  git branch -M main
  git remote add origin https://github.com/SU-USUARIO/bcg-sitio.git
  git push -u origin main
  ```

  Se abrirá una ventana para iniciar sesión en GitHub; acéptela. Si `git commit` pide su nombre y correo, ejecute antes:
  `git config --global user.name "Su Nombre"` y `git config --global user.email "su-correo"`.
- [ ] **12. Verificar:** recargue la página del repositorio en GitHub; deben verse las carpetas `src`, `public`, etc. El archivo `.env` **no** debe aparecer (es correcto: es privado).

## FASE 3 — Dominio y Cloudflare

- [ ] **13. Comprar el dominio en Akky.** Anote el nombre exacto (por ejemplo `benitezconsulting.mx`).
- [ ] **14. Crear cuenta en Cloudflare:** https://cloudflare.com → *Sign up*.
- [ ] **15. Agregar el dominio:** *Add a domain* (o *Onboard a domain*) → escriba su dominio → elija el plan **Free** → *Continue*. Deje que escanee los registros DNS y continúe.
- [ ] **16. Copiar los nameservers.** Cloudflare le mostrará **dos nameservers** (algo como `xxxx.ns.cloudflare.com`). Cópielos.
- [ ] **17. Cambiar los nameservers en Akky.** En el panel de Akky, entre a la gestión de su dominio, busque «Servidores DNS» / «Nameservers» y sustituya los que tiene por los dos de Cloudflare. Si no encuentra la opción, pregunte a soporte de Akky si permite cambiar nameservers.
- [ ] **18. Esperar la activación.** En Cloudflare pulse *Check nameservers*. Puede tardar de minutos a unas horas; Cloudflare le envía un correo cuando el dominio queda «Active».

## FASE 4 — Publicar el sitio con Cloudflare Pages

- [ ] **19. Crear el proyecto:** en Cloudflare, menú **Workers & Pages** → *Create* → pestaña **Pages** → *Connect to Git*. Autorice GitHub y elija el repositorio `bcg-sitio`.
- [ ] **20. Configurar la construcción:**
  - Framework preset: **Astro**
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Root directory: vacío
- [ ] **21. Agregar variables de entorno** (en *Environment variables*, para *Production*):
  - `SITE_URL` = `https://www.su-dominio.mx` (su dominio real, con https)
  - `PUBLIC_FORM_ENDPOINT` = `https://formspree.io/f/mnpjyopz`
  - `NODE_VERSION` = `20`
- [ ] **22. Desplegar:** *Save and Deploy*. Al terminar, Cloudflare da una dirección `algo.pages.dev`. Ábrala y revise el sitio completo.
- [ ] **23. Conectar su dominio:** en el proyecto, pestaña **Custom domains** → *Set up a custom domain* → escriba `www.su-dominio.mx` (y también el dominio sin www si lo desea). Cloudflare crea el DNS y el certificado HTTPS solo; espere unos minutos hasta que diga «Active».

## FASE 5 — Verificación final

- [ ] **24. Probar en el dominio real:** abra `https://www.su-dominio.mx`, envíe otro mensaje de prueba por el formulario y pruebe el botón de WhatsApp.
- [ ] **25. Probar en su celular:** menú, áreas de práctica, tarjetas de clientes, formulario.
- [ ] **26. Aviso de privacidad.** Pida a un abogado que revise `/aviso-de-privacidad`. Después, en `src/pages/aviso-de-privacidad.astro`, complete el domicilio legal y elimine el recuadro de borrador.
- [ ] **27. Pedir autorización** a las instituciones (Universidad Anáhuac México, CAMI Xochimilco) para mostrar su nombre en el sitio.

## Hacer cambios después

Cuando edite cualquier archivo, ejecute en la terminal de `sitio`:

```
git add .
git commit -m "Descripción del cambio"
git push
```

Cloudflare detecta el cambio y republica el sitio en 1–2 minutos.

## Si algo falla

- **El formulario abre el correo en lugar de enviar:** falta `PUBLIC_FORM_ENDPOINT` en Cloudflare, o no se volvió a desplegar después de agregarla (*Deployments* → *Retry deployment*).
- **La construcción falla en Cloudflare:** revise que `NODE_VERSION` sea `20` y que el comando sea `npm run build`.
- **El dominio no activa:** confirme en Akky que los nameservers sean exactamente los de Cloudflare.
