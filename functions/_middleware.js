// Responde "410 Gone" a las direcciones spam que dejó el hackeo del sitio antiguo
// (por ejemplo /?product/..., /goods/..., /contact/...). Así Google las saca del índice
// más rápido que con un 404. Todo lo demás sigue sin cambios.
const RUTAS_SPAM = /^\/(goods|contact|product|products|shop|item|detail)(\/|$)/i;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let consulta = url.search.toLowerCase();
  try { consulta = decodeURIComponent(consulta); } catch (e) { /* consulta mal formada: se usa tal cual */ }
  const esSpam = RUTAS_SPAM.test(url.pathname) || consulta.startsWith('?product') || consulta.includes('product/');
  if (esSpam) {
    return new Response('Esta página no existe.', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
  return context.next();
}
