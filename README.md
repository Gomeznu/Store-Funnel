# Panel de Tiendas — Funnel, Riesgo y Ritmo (Matriz TPF)

Dashboard estático (HTML/CSS/JS, sin backend) para revisar semanalmente el funnel de
originación, el riesgo de cartera y el ritmo de venta de las tiendas de la Matriz TPF.
Todo el procesamiento de los archivos que subes ocurre en tu propio navegador
(localStorage) — no hay servidor ni base de datos detrás.

## Contenido
- `index.html` — la app completa (un solo archivo).
- `netlify/edge-functions/gate.mts` — protege el sitio completo con una clave
  compartida (variable de entorno `SITE_PASSWORD`), usando una cookie de sesión firmada.
  Funciona en el plan gratuito de Netlify.
- `netlify.toml` — configuración de build/headers.

## Desplegar en Netlify

### Opción A — arrastrar y soltar (sin instalar nada)
1. Entra a https://app.netlify.com/projects/payjoy-tpf-tiendas
2. Ve a la pestaña "Deploys".
3. Arrastra esta carpeta completa (`netlify-site`) a la zona de deploy.
4. Netlify detecta `netlify.toml` y la carpeta `netlify/edge-functions` automáticamente.

### Opción B — desde GitHub (deploys automáticos)
1. Sube este contenido a un repo en GitHub (ver abajo).
2. En Netlify: Site settings → Build & deploy → Link repository → elige el repo.
3. Cada vez que actualices el repo, Netlify vuelve a desplegar solo.

## Subir a GitHub sin usar la terminal
1. Ve a https://github.com/new, crea un repo (puede ser privado).
2. Dentro del repo nuevo, click "uploading an existing file".
3. Arrastra todos los archivos de esta carpeta (incluida la subcarpeta `netlify/`).
4. Commit changes.

## La clave del sitio
Ya está configurada como variable de entorno `SITE_PASSWORD` en el sitio de Netlify.
Para cambiarla: Netlify → Site configuration → Environment variables → `SITE_PASSWORD`.
