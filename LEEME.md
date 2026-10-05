# Leonett Community — sitio web

Sitio estático (HTML, CSS y JavaScript). No necesita instalación, base de datos ni compilación.

## Estructura

```
index.html            Inicio
servicios.html        Los 4 servicios en detalle
nosotros.html         Historia, principios y equipo
casos-de-exito.html   Casos y testimonios
contacto.html         Formulario y canales
gracias.html          Confirmación del formulario
privacidad.html       Política de privacidad (borrador)
terminos.html         Términos y condiciones (borrador)
404.html              Página de error
css/styles.css        Todos los estilos
js/main.js            Menú, animaciones y formulario
fonts/                Playfair Display y Poppins (licencia OFL incluida)
images/               Logos, ícono e imagen para redes
favicon.svg · robots.txt · sitemap.xml · .htaccess
```

## Verlo en tu computador

Abre `index.html` con doble clic. Todo funciona sin servidor.

## Antes de publicar: buscar y reemplazar

Con un editor como VS Code usa "Buscar y reemplazar en todos los archivos":

| Buscar | Reemplazar por | Dónde aparece |
|---|---|---|
| `56900000000` | Tu WhatsApp, solo dígitos (56 9 XXXX XXXX) | Todas las páginas y `js/main.js` |
| `contacto@tudominio.cl` | Tu email | Todas las páginas |
| `https://www.tudominio.cl` | Tu dominio real | Todas las páginas, `robots.txt`, `sitemap.xml` |
| `[` | Revisa uno por uno cada texto entre corchetes | Cifras, casos, testimonios, historia, legales |

Los textos pendientes se ven en pantalla con un borde punteado. Ese borde desaparece al quitar el atributo `data-placeholder` de la etiqueta.

Si todavía no tienes cifras, casos o testimonios reales, oculta la sección completa agregando `hidden` a su etiqueta: `<section hidden class="...">`.

## Formulario

Sin configurar nada, el formulario abre WhatsApp con los datos ya escritos.

Para recibirlo por email con Formspree:
1. Crea un formulario en formspree.io y copia tu código.
2. En `index.html` y `contacto.html` busca `TU_ID` y reemplázalo por ese código.

Después de enviar, el visitante llega a `gracias.html`. Las instrucciones para Netlify Forms o un backend propio están en un comentario sobre el formulario.

## Cambiar colores y tipografías

Todo está en el bloque `:root` al inicio de `css/styles.css`. Por ejemplo, `--rojo` controla botones y enlaces, y `--noche` las secciones oscuras.

## Cambiar textos

Cada página es un archivo HTML con secciones comentadas (`<!-- HERO -->`, `<!-- SERVICIOS -->`). El header y el footer se repiten en cada página: si cambias el menú, cámbialo en todas.

## Cambiar imágenes

- Logos: `images/logo-mark.svg` (header) y `images/logo-full.svg` (footer).
- Fotos de clientes y del equipo: guarda los archivos en `images/` en formato WebP y sigue el comentario que hay junto a cada espacio reservado.
- Imagen al compartir en redes: `images/og-image.jpg` (1200 × 630 px).

## Publicar

Sube todo el contenido de esta carpeta a la carpeta pública de tu hosting (`public_html` en cPanel) por el administrador de archivos o por FTP. `index.html` debe quedar en la raíz. También funciona arrastrando la carpeta a Netlify o Cloudflare Pages.

## Checklist final

- [ ] WhatsApp, email y dominio reemplazados
- [ ] No queda ningún texto entre corchetes visible
- [ ] Cada promesa del sitio corresponde a lo que entregas (diagnóstico gratis de 30 minutos, respuesta en 24 horas hábiles, listas de "Qué incluye")
- [ ] Privacidad y términos revisados por un abogado, sin el aviso amarillo
- [ ] Formulario probado desde el celular
- [ ] Certificado SSL (https) activo en el hosting
- [ ] `sitemap.xml` enviado en Google Search Console
