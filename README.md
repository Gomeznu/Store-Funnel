# Panel de Tiendas — Funnel, Riesgo y Ritmo (Matriz TPF)

Dashboard estático (HTML/CSS/JS) para revisar semanalmente el funnel de originación,
el riesgo de cartera y el ritmo de venta de las tiendas de la Matriz TPF.

## Arquitectura (dos niveles de acceso)
1. **Ver el dashboard** — protegido con usuario y contraseña (HTTP Basic Auth), a
   nivel de todo el sitio (`netlify/edge-functions/gate.mts`). Compártelo solo con
   las personas que deban poder verlo (ej. tus 7 supervisores).
2. **Cargar/actualizar data** — protegido con una clave aparte, solo dentro de la
   app (`netlify/functions/data.mts`, usando Netlify Blobs para guardar la data
   entre visitas). Solo quien tenga esta clave puede subir el CSV semanal, cambiar
   la matriz de tiendas, o borrar semanas guardadas — aunque ya haya pasado el
   usuario/contraseña de la vista.

Es decir: las 7 personas con el usuario/contraseña pueden **ver** todo, pero solo
quien además tenga la clave de carga puede **modificar** algo.

## Variables de entorno a configurar en Netlify
Site configuration → Environment variables → Add a variable, una por una:

| Variable | Para qué | Valor sugerido |
|---|---|---|
| `VIEW_USERNAME` | Usuario para ver el sitio | `tiendas-tpf` |
| `VIEW_PASSWORD` | Contraseña para ver el sitio | `CarteraTPF2159@` |
| `UPLOAD_PASSWORD` | Clave para cargar/actualizar data | (la que uses solo tú) |

Si `VIEW_USERNAME`/`VIEW_PASSWORD` no están configuradas, el sitio queda abierto sin
pedir nada (para que nunca te quedes tú mismo afuera por accidente) — configúralas
antes de compartir el link.

## Desplegar en Netlify

### Opción A — importar desde GitHub (recomendado)
1. Sube este contenido a un repo en GitHub (puede ser privado).
2. En Netlify: "Add new project" → "Import an existing project" → GitHub → elige el repo.
3. Build command: vacío. Publish directory: `.` (la raíz, donde está index.html).
4. Deploy. Netlify detecta `netlify/edge-functions/gate.mts` y `netlify/functions/data.mts` solo.
5. Agrega las 3 variables de entorno (tabla de arriba).
6. Vuelve a desplegar (Deploys → Trigger deploy) para que las variables tomen efecto.

### Opción B — arrastrar y soltar
1. Arrastra esta carpeta completa a la pestaña "Deploys" de tu sitio en Netlify.
2. Agrega las 3 variables de entorno y vuelve a desplegar.

## Notas
- El historial semanal por tienda (Funnel y Riesgo) vive en Netlify Blobs, compartido
  para todos los que vean el link — no depende del navegador de cada persona.
- El "Historial semanal" con gráfico de tendencia (botón "Guardar esta semana" dentro
  de cada pestaña) sigue siendo local a cada navegador — es un extra opcional, no es
  la fuente de verdad de la data.
- Para agregar o quitar personas del grupo de 7: como es un usuario/contraseña
  compartido, cambiar la contraseña en Netlify revoca el acceso a todos a la vez
  (tendrías que volver a compartirla con quienes sí deban seguir entrando).
