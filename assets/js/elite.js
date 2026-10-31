/* Élite Time — núcleo compartido: datos, carrito, cabecera/pie, intro, transiciones y animaciones. */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CART = 'elitetime-cart';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => n ? '$' + Number(n).toLocaleString('es-CO') : 'Consultar';
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true } catch (e) { return false } }
};
/* Halloween (pedido del cliente, solo el 31 de octubre en Barranquilla): tema naranja, murciélagos y la
   promoción de la línea Pro Diver de $580.000 a $515.000 con envío gratis. Se apaga sola a la medianoche;
   con ?halloween=1 en la dirección se puede ver otro día para probar. */
const hoyBq = new Date(Date.now() - 5 * 3600e3);
const HALLOWEEN = /[?&]halloween=1/.test(location.search) || (hoyBq.getUTCFullYear() === 2026 && hoyBq.getUTCMonth() === 9 && hoyBq.getUTCDate() === 31);
const PROMO = { antes: 580000, hoy: 515000, fin: Date.UTC(hoyBq.getUTCFullYear(), hoyBq.getUTCMonth(), hoyBq.getUTCDate() + 1, 5) };
if (HALLOWEEN) document.documentElement.classList.add('halloween');

const DEFAULT_SETTINGS = { wa: '573105300899', pin: '2026', sub: '', show: { perfumes: true, pedir: true, garantia: true, destacados: true } };
const DEFAULT_CLIENTES = [
  { src: 'img/clientes/cliente-4.webp', txt: 'Invicta Racing naranja · Barranquilla' },
  { src: 'img/clientes/cliente-1.webp', txt: 'Entrega personal · Barranquilla' },
  { src: 'video/entrega.mp4', tipo: 'video', txt: 'Su Élite Time, recién entregado' },
  { src: 'img/clientes/cliente-2.webp', txt: 'Invicta en caja de impacto' },
  { src: 'img/clientes/cliente-3.webp', txt: 'Entrega doble para clientes Élite' }
];
const BRANDS = {
  Invicta: { slug: 'invicta', logo: 'img/marca/invicta.webp', since: 'Desde 1837', line: 'Pro Diver, Speedway, Racing, Aviator y Angel. Diseño deportivo con presencia de sobra.', lines: ['Pro Diver', 'Speedway', 'Racing', 'Specialty', 'Aviator', 'Angel', 'Wildflower'] },
  Technomarine: { slug: 'technomarine', word: 'TECHNOMARINE', since: 'Ginebra · Miami', line: 'Cruise, Coral y Ocean. Color, carácter y bisel que se nota a distancia.', lines: ['Cruise', 'Coral', 'Ocean Quantum', 'Ocean Nomad'] },
  Curren: { slug: 'curren', logo: 'img/marca/curren-blanco.webp', since: 'Cronógrafos', line: 'Cronógrafos modernos que llegan en su caja original con manual en español.', lines: ['Pídelo por WhatsApp'] },
  Poedagar: { slug: 'poedagar', logo: 'img/marca/poedagar.webp', since: 'Acero clásico', line: 'Elegancia clásica de acero con fechador, a un precio de entrada.', lines: ['Fondo azul', 'Fondo verde', 'Fondo blanco'] }
};
const PAGES = [
  ['index.html', 'Inicio'], ['coleccion.html', 'Colección'], ['marcas.html', 'Marcas'],
  ['clientes.html', 'Clientes'], ['perfumes.html', 'Perfumes'], ['comprar.html', 'Cómo comprar'], ['preguntas.html', 'Preguntas']
];
const ICON = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg>',
  arrow: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.2.5.2.5.4.1.1.1.7-.1 1.3Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8h16M4 16h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

/* ================= datos ================= */
const E = window.Elite = { $, $$, esc, fmt, ICON, BRANDS, reduce, fine, store, data: null };
let readyFns = [], isReady = false;
E.ready = fn => isReady ? fn(E.data) : readyFns.push(fn);

/* El catálogo vive en la base de datos de Cloudflare (lo edita el panel).
   Si la API no responde en 4 s, la tienda usa la copia de data/productos.json. */
const API = 'https://elite-time-panel.pages.dev/api/catalog', CACHE = 'elitetime-catalog';
/* la consulta arranca apenas carga este archivo, sin esperar al resto de la página */
const apiP = fetch(API).then(r => r.ok ? r.json() : null).then(d => { if (d && Array.isArray(d.productos)) store.set(CACHE, { t: Date.now(), d }); return d }).catch(() => null);
async function loadData() {
  /* si ya hay una copia de menos de 10 minutos se usa de inmediato (la consulta la renueva para la próxima vez);
     si no, se espera a la base de datos como máximo 2,5 s */
  const cached = store.get(CACHE, null);
  let remote = cached && Date.now() - cached.t < 10 * 60e3 ? cached.d : null;
  if (!remote) remote = await Promise.race([apiP, new Promise(r => setTimeout(() => r(null), 2500))]) || (cached && cached.d);
  if (remote && Array.isArray(remote.productos)) {
    E.data = { productos: remote.productos, clientes: remote.clientes || structuredClone(DEFAULT_CLIENTES), settings: { ...structuredClone(DEFAULT_SETTINGS), ...remote.settings, show: { ...DEFAULT_SETTINGS.show, ...(remote.settings || {}).show } } };
  } else {
    let base = [];
    try { base = await (await fetch('data/productos.json')).json() } catch (e) { }
    E.data = { productos: base, clientes: structuredClone(DEFAULT_CLIENTES), settings: structuredClone(DEFAULT_SETTINGS) };
  }
  E.DEFAULT_SETTINGS = DEFAULT_SETTINGS; E.DEFAULT_CLIENTES = DEFAULT_CLIENTES;
  if (HALLOWEEN) E.data.productos.forEach(p => {
    if (/pro\s*diver/i.test(p.modelo || '') && Number(p.precio) === PROMO.antes) { p.antes = p.precio; p.precio = PROMO.hoy; p.promo = true }
  });
}
E.HALLOWEEN = HALLOWEEN; E.PROMO = PROMO;
E.byId = id => E.data.productos.find(p => p.id === id);
E.brands = () => { const s = new Set(Object.keys(BRANDS)); E.data.productos.forEach(p => s.add(p.marca)); return [...s] };
E.specs = p => p.specs && p.specs.length ? p.specs : ['Movimiento de cuarzo', 'Acero inoxidable', 'Resistente al agua'];
E.wa = msg => `https://wa.me/${E.data.settings.wa}?text=${encodeURIComponent(msg)}`;
E.phone = () => E.data.settings.wa.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
E.url = p => `reloj.html#${p.id}`;
/* cada foto en varios tamaños: el navegador descarga solo el que necesita la pantalla */
const VAR = { relojes: [[400, 700], 1100], clientes: [[500], 1000], modelo: [[600], 825], tula: [[700], 1050] };
E.srcset = src => { const m = /^img\/(relojes|clientes|modelo|tula)\/([\w-]+)\.webp$/.exec(src || ''); if (!m) return ''; const [ws, full] = VAR[m[1]]; return ws.map(w => `img/${m[1]}/${m[2]}-${w}.webp ${w}w`).concat(`${src} ${full}w`).join(', ') };
E.img = (src, alt, sizes, attrs = '') => { const ss = E.srcset(src); return `<img src="${esc(src)}"${ss ? ` srcset="${ss}" sizes="${sizes}"` : ''} alt="${esc(alt)}" decoding="async" ${attrs}>` };
/* número con el logo de WhatsApp, enlazado al chat */
E.phoneHTML = (cls = '') => `<a class="wa-num ${cls}" href="${E.wa('Hola Élite Time, vi su página web y quiero información sobre sus relojes.')}" target="_blank" rel="noopener">${ICON.wa}<span>${E.phone()}</span></a>`;

E.card = (p, i = 0) => `<a class="pcard${p.disponible === false ? ' sold' : ''}" href="${E.url(p)}" data-cursor="Ver" data-id="${esc(p.id)}">
  ${p.disponible === false ? '<span class="tag">Agotado</span>' : p.promo ? '<span class="tag hw">Halloween</span>' : p.destacado ? '<span class="tag gold">Destacado</span>' : ''}
  <div class="cush">${E.img(p.imagen, p.marca + ' ' + p.modelo, '(max-width:560px) 46vw, (max-width:1100px) 30vw, 300px', `loading="${i < 4 ? 'eager' : 'lazy'}"`)}</div>
  <div class="info"><span class="brand">${esc(p.marca)} · ${esc(p.genero)}</span><h3>${esc(p.modelo)}</h3>
  <div class="row"><span class="price">${p.antes ? `<s class="was">${fmt(p.antes)}</s>` : ''}${fmt(p.precio)}</span>${p.disponible === false ? '' : `<button class="add" data-add="${esc(p.id)}" aria-label="Agregar ${esc(p.modelo)} al carrito">${ICON.plus}</button>`}</div></div></a>`;

/* ================= carrito ================= */
const cart = { items: store.get(CART, []) };
E.cart = cart;
cart.save = () => { store.set(CART, cart.items); renderCart() };
cart.add = (id, qty = 1, caja = '', fromEl) => {
  const p = E.byId(id); if (!p) return;
  const f = cart.items.find(x => x.id === id && x.caja === caja);
  f ? f.qty += qty : cart.items.push({ id, qty, caja });
  cart.save(); fly(fromEl, p); toast(`${p.modelo} agregado al carrito`);
  const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
};
cart.count = () => cart.items.reduce((a, b) => a + b.qty, 0);
cart.total = () => cart.items.reduce((a, b) => a + (E.byId(b.id)?.precio || 0) * b.qty, 0);
function fly(fromEl, p) {
  if (reduce || !fromEl) return;
  const src = fromEl.closest('.pcard,.pd-stage,.feat,[data-fly]')?.querySelector('img'), to = $('#cartBtn');
  if (!src || !to) return;
  const a = src.getBoundingClientRect(), b = to.getBoundingClientRect();
  const f = document.createElement('img'); f.src = p.imagen; f.className = 'flyer'; document.body.appendChild(f);
  const x0 = a.left + a.width / 2 - 45, y0 = a.top + a.height / 2 - 45, x1 = b.left + b.width / 2 - 45, y1 = b.top + b.height / 2 - 45;
  f.animate([
    { transform: `translate(${x0}px,${y0}px) scale(1)`, opacity: 1 },
    { transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 120}px) scale(.8) rotate(-20deg)`, opacity: 1, offset: .5 },
    { transform: `translate(${x1}px,${y1}px) scale(.15) rotate(-40deg)`, opacity: .2 }
  ], { duration: 900, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => f.remove();
}
function renderCart() {
  const n = cart.count(), c = $('#cartCount'); if (!c) return;
  c.textContent = n; c.classList.toggle('on', n > 0);
  const box = $('#cartItems');
  if (!cart.items.length) {
    box.innerHTML = `<div class="empty-cart">${ICON.bag}<p>Tu carrito está vacío.<br>Elige un reloj y aparecerá aquí.</p><a class="btn ghost sm" href="coleccion.html">Ver la colección</a></div>`;
    $('#cartFoot').hidden = true; return;
  }
  $('#cartFoot').hidden = false;
  box.innerHTML = cart.items.map((it, i) => { const p = E.byId(it.id); if (!p) return ''; return `<div class="citem">
    ${E.img(p.imagen, '', '76px')}<div><h4>${esc(p.marca)} ${esc(p.modelo)}</h4><small>${it.caja ? '+ Caja ' + esc(it.caja) + ' (adicional) · ' : 'Caja original · '}${fmt(p.precio)}${p.promo ? ' · promo Halloween' : ''}</small>
    <div class="qty"><button data-q="-1" data-i="${i}" aria-label="Quitar uno">−</button><span>${it.qty}</span><button data-q="1" data-i="${i}" aria-label="Agregar uno">+</button></div></div>
    <button class="rm" data-rm="${i}">Quitar</button></div>` }).join('');
  $('#cartTotal').textContent = fmt(cart.total());
}
function checkout() {
  const name = $('#cName').value.trim(), city = $('#cCity').value.trim(), pay = $('#cPay').value;
  const lines = cart.items.map(it => { const p = E.byId(it.id); return `• ${it.qty} × ${p.marca} ${p.modelo}${it.caja ? ' + caja ' + it.caja + ' (costo adicional por confirmar)' : ''} — ${fmt(p.precio * it.qty)}${p.promo ? ' (promo Halloween, antes ' + fmt(p.antes * it.qty) + ')' : ''}` });
  const promo = cart.items.some(it => E.byId(it.id)?.promo);
  const msg = `Hola Élite Time, quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: ${fmt(cart.total())}\n${promo ? 'Envío gratis por la promoción de Halloween\n' : ''}${name ? 'Nombre: ' + name + '\n' : ''}${city ? 'Ciudad: ' + city + '\n' : ''}Pago: ${pay}\n\n¿Me confirman disponibilidad y envío?`;
  $('#cGo').href = E.wa(msg);
}
E.openCart = () => { $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); checkout(); lenis?.stop() };
E.closeCart = () => { $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); lenis?.start() };

/* ================= toast ================= */
function toast(m) { const t = $('#toast'); t.innerHTML = `<span style="color:var(--gold-2)">◆</span> ${esc(m)}`; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600) }
E.toast = toast;

/* ================= cabecera y pie ================= */
function chrome() {
  /* Halloween: en el inicio unos murciélagos cruzan la pantalla (capas que mueve la tarjeta gráfica, sin tocar la página) */
  if (HALLOWEEN && !reduce && document.getElementById('hwBand')) document.body.insertAdjacentHTML('beforeend', `<div class="murcielagos" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i style="--i:${i}"><svg viewBox="0 0 64 30"><path d="M32 9L29.5 5 29 10C25 7 14 4 2 9c5 2 7 6 7 11 3-3 7-3 10 0 2-3 6-3 8 1l5 6 5-6c2-4 6-4 8-1 3-3 7-3 10 0 0-5 2-9 7-11-12-5-23-2-27 1L34.5 5Z"/></svg></i>`).join('')}</div>`);
  /* Cloudflare Pages sirve las páginas sin «.html» (/coleccion): se compara siempre con el nombre del archivo */
  const here = (location.pathname.split('/').pop() || 'index').toLowerCase().replace(/\.html$/, '') + '.html';
  const cur = h => here === h || (h === 'coleccion.html' && here === 'reloj.html') ? ' aria-current="page"' : '';
  const ann = [...(HALLOWEEN ? ['🎃 Promoción de Halloween · solo hoy', 'Línea Pro Diver: antes $580.000, hoy $515.000', 'Envío gratis en la promoción'] : []), 'Relojería 100% original', 'Garantía de 1 año en maquinaria y batería', 'Envíos a toda Colombia', 'Pago contra entrega en Barranquilla y Soledad', `${ICON.wa} Pedidos por WhatsApp · ${E.phone()}`];
  document.body.insertAdjacentHTML('afterbegin', `
  <a href="#main" class="btn sm" style="position:fixed;left:-999px;top:8px;z-index:999" onfocus="this.style.left='8px'" onblur="this.style.left='-999px'">Saltar al contenido</a>
  <div class="announce" aria-label="Anuncios"><div class="track">${(ann.map(a => `<span>${a}</span>`).join('')).repeat(2)}</div></div>
  <header class="site-head" id="head"><div class="wrap head-in">
    <a class="logo" href="index.html" aria-label="Élite Time, inicio"><img src="img/marca/logo-h.webp" alt="Élite Time" width="104" height="45"></a>
    <ul class="nav">${PAGES.slice(1).map(([h, t]) => `<li><a href="${h}"${cur(h)}>${t}</a></li>`).join('')}</ul>
    <div class="head-actions">
      <a class="btn sm" data-wa href="#" target="_blank" rel="noopener">${ICON.wa}Pedir</a>
      <button class="icon-btn" id="cartBtn" aria-label="Abrir carrito">${ICON.bag}<span class="cart-count" id="cartCount">0</span></button>
      <button class="icon-btn burger" id="burger" aria-label="Abrir menú" aria-expanded="false">${ICON.menu}</button>
    </div></div></header>
  <div class="mmenu" id="mmenu" role="dialog" aria-label="Menú">
    <div class="mm-top"><a class="logo" href="index.html"><img src="img/marca/logo-h.webp" alt="Élite Time" width="104" height="45"></a><button class="icon-btn" id="mmClose" aria-label="Cerrar menú">${ICON.close}</button></div>
    <nav>${PAGES.map(([h, t], i) => `<a href="${h}"${cur(h)}><small>0${i + 1}</small>${t}</a>`).join('')}</nav>
    <div class="mm-foot">${E.phoneHTML()}<span>Barranquilla · Envíos a toda Colombia</span></div>
  </div>
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Carrito">
    <header><h3>Tu carrito</h3><button class="icon-btn" id="cartClose" aria-label="Cerrar carrito">${ICON.close}</button></header>
    <div class="items" id="cartItems"></div>
    <footer id="cartFoot">
      <div class="tot"><span>Total</span><b id="cartTotal">$0</b></div>
      <div class="cfields"><input id="cName" placeholder="Tu nombre" autocomplete="name" aria-label="Tu nombre"><input id="cCity" placeholder="Ciudad" autocomplete="address-level2" aria-label="Ciudad">
      <select id="cPay" class="full" aria-label="Forma de pago"><option>Contra entrega (Barranquilla y Soledad)</option><option>Transferencia</option></select></div>
      <a class="btn block" id="cGo" href="#" target="_blank" rel="noopener">${ICON.wa}Enviar pedido por WhatsApp</a>
      <small style="color:var(--dim);text-align:center">Te confirmamos disponibilidad, caja y envío por WhatsApp.</small>
    </footer>
  </aside>
  <div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="progress" id="progress" aria-hidden="true"></div>
  <a class="wa-fab" data-wa href="#" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${ICON.wa}</a>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`);
  const main = $('main'); if (main && !main.id) main.id = 'main';
  document.body.insertAdjacentHTML('beforeend', `<footer class="site-foot bg-tex">
    <div class="wrap foot-cta"><span class="eyebrow">Tu próximo reloj</span><h2 data-split>El tiempo define <em class="gold">tu estilo.</em></h2><a class="btn" data-wa href="#" target="_blank" rel="noopener" data-magnetic>${ICON.wa}Hablemos por WhatsApp</a></div>
    <div class="wrap foot-grid">
      <div><a class="logo" href="index.html"><img src="img/marca/logo-h.webp" alt="Élite Time" style="height:70px"></a><p class="lead" style="margin-top:18px;font-size:.95rem">Relojes para quienes marcan la diferencia. Relojería y perfumería original desde Barranquilla para toda Colombia.</p></div>
      <div><h4>Tienda</h4><ul>${PAGES.slice(1).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>
      <div><h4>Marcas</h4><ul>${Object.keys(BRANDS).map(b => `<li><a href="coleccion.html#${BRANDS[b].slug}">${b}</a></li>`).join('')}</ul></div>
      <div><h4>Pedidos</h4><p class="phone">${E.phoneHTML()}</p><ul style="margin-top:12px"><li><a href="https://www.instagram.com/elitetimebq/" target="_blank" rel="noopener">Instagram · @elitetimebq</a></li><li><a href="https://www.tiktok.com/@elitetimebaq" target="_blank" rel="noopener">TikTok · @elitetimebaq</a></li><li><a href="https://www.facebook.com/share/1DhSsEF17G/" target="_blank" rel="noopener">Facebook · Elite Time bq</a></li></ul></div>
    </div>
    <div class="wrap"><a class="wn-strip" href="https://www.webnaria.store/?utm_source=elitetime&utm_medium=footer&utm_campaign=creado_por" target="_blank" rel="noopener">
      <img src="img/marca/webnaria.webp" alt="Webnaria" width="38" height="38">
      <span class="wn-t"><small>Página creada por Webnaria</small><b>¿Te gustó esta web? <em>Tu negocio puede tener una igual.</em></b></span>
      <span class="wn-go">Quiero mi web<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </a></div>
    <div class="foot-word" aria-hidden="true" data-parallax="-.08">ÉLITE TIME</div>
    <div class="wrap legal"><span>© ${new Date().getFullYear()} Élite Time · Barranquilla, Colombia</span><span>Relojería original</span></div>
  </footer>`);
}

function wireWa() {
  $$('[data-wa]').forEach(a => { if (!a.dataset.waset) a.href = E.wa(a.dataset.wa || 'Hola Élite Time, vi su página web y quiero información sobre sus relojes.') });
}

/* ================= interacciones globales ================= */
let lenis = null;
function bindGlobal() {
  const head = $('#head'); let lastY = 0;
  const onScroll = y => { head.classList.toggle('solid', y > 10); head.classList.toggle('hide', y > 300 && y > lastY && !$('#drawer').classList.contains('on')); lastY = y };
  addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  $('#burger').onclick = () => { $('#mmenu').classList.add('open'); $('#burger').setAttribute('aria-expanded', 'true'); lenis?.stop() };
  $('#mmClose').onclick = () => { $('#mmenu').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false'); lenis?.start() };
  $('#cartBtn').onclick = E.openCart; $('#cartClose').onclick = E.closeCart; $('#scrim').onclick = E.closeCart;
  addEventListener('keydown', e => { if (e.key === 'Escape') { E.closeCart(); $('#mmClose').click() } });
  $('#cartItems').addEventListener('click', e => {
    const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { const it = cart.items[+q.dataset.i]; it.qty += +q.dataset.q; if (it.qty < 1) cart.items.splice(+q.dataset.i, 1); cart.save(); checkout() }
    if (r) { cart.items.splice(+r.dataset.rm, 1); cart.save(); checkout() }
  });
  ['#cName', '#cCity', '#cPay'].forEach(s => $(s).addEventListener('input', checkout));
  $('#cGo').addEventListener('click', checkout);
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); e.stopPropagation(); cart.add(add.dataset.add, 1, '', add); }
  }, true);
}

/* magnetismo + inclinación de tarjetas (el puntero queda normal) */
function pointerFx() {
  if (!fine || reduce) return;
  document.addEventListener('pointermove', e => {
    const m = e.target.closest('[data-magnetic]');
    $$('[data-magnetic]').forEach(el => { if (el !== m) el.style.transform = '' });
    if (m) { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)` }
    const card = e.target.closest('.pcard');
    if (card) { const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; card.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`; card._t = 1 }
  }, { passive: true });
  document.addEventListener('pointerout', e => { const card = e.target.closest('.pcard'); if (card && !card.contains(e.relatedTarget)) { card.style.transition = 'transform .7s var(--ease),border-color .5s,box-shadow .6s'; card.style.transform = ''; setTimeout(() => card.style.transition = '', 700) } });
}

/* sin animación entre páginas: solo se marca que se llegó desde el sitio
   para que el inicio no repita la intro */
function transitions() {
  try { sessionStorage.removeItem('et-trans') } catch (_) { }
  addEventListener('pageshow', e => { if (e.persisted) $('#mmenu')?.classList.remove('open') });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || a.target === '_blank') return;
    const href = a.getAttribute('href'); if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href)) return;
    try { sessionStorage.setItem('et-trans', '1') } catch (_) { }
  });
}

/* intro: el bisel se dibuja, el logo sube, la marca aparece letra a letra
   y la pantalla se abre en dos por una línea dorada. Una vez por sesión. */
function intro() {
  return new Promise(res => {
    /* En el inicio se ve siempre que se abre o recarga la página; si se llega desde otra
       página del sitio (con la cortina) no se repite. En las demás páginas, solo la primera vez. */
    let seen = false, viaSite = false; try { seen = sessionStorage.getItem('et-intro'); viaSite = sessionStorage.getItem('et-trans') } catch (e) { }
    const home = !!$('#dial');
    if (reduce || !window.gsap || document.body.dataset.intro === 'off' || (home ? viaSite : seen)) return res();
    try { sessionStorage.setItem('et-intro', '1') } catch (e) { }
    const el = document.createElement('div'); el.className = 'intro';
    const ticks = Array.from({ length: 60 }, (_, i) => `<line class="tk" x1="100" y1="${i % 5 ? 8 : 4}" x2="100" y2="${i % 5 ? 13 : 16}" stroke="${i % 5 ? '#6f685d' : '#caae76'}" stroke-width="${i % 5 ? 1 : 2}" transform="rotate(${i * 6} 100 100)"/>`).join('');
    el.innerHTML = `<div class="half t"></div><div class="half b"></div><div class="seam"></div>
      <div class="core">
        <div class="mark"><div class="ring"><svg viewBox="0 0 200 200"><circle class="arc" cx="100" cy="100" r="97" fill="none" stroke="#caae76" stroke-width="1.2" stroke-dasharray="610" stroke-dashoffset="610" transform="rotate(-90 100 100)"/>${ticks}</svg></div><img src="img/marca/logo.webp" alt=""></div>
        <div class="name" aria-hidden="true">${[...'RELOJERÍA ORIGINAL'].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div>
        <div class="num">000</div>
      </div>
      <div class="meta">BARRANQUILLA · COLOMBIA</div><div class="bar"></div>`;
    document.body.appendChild(el); document.documentElement.style.overflow = 'hidden';
    const n = { v: 0 }, num = $('.num', el);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    /* solo opacidad: tocar el transform de cada marca les borra su rotación y descuadra el aro */
    tl.from($$('.tk', el), { opacity: 0, duration: .5, ease: 'power1.out', stagger: { each: .012, from: 'start' } }, 0)
      .to($('.arc', el), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, .1)
      .to(n, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => num.textContent = String(Math.round(n.v)).padStart(3, '0') }, .1)
      .to($('.bar', el), { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, .1)
      .to($('.mark img', el), { clipPath: 'inset(0% 0 0 0)', duration: 1.1 }, .45)
      .from($('.mark img', el), { y: 30, duration: 1.1 }, .45)
      .to($$('.name span', el), { opacity: 1, y: 0, duration: .9, stagger: .045 }, .7)
      .to($('.mark .ring', el), { rotation: 90, transformOrigin: '50% 50%', duration: 1.6, ease: 'power3.inOut' }, .2)
      .from($('.num', el), { opacity: 0, y: 10, duration: .6 }, .2)
      /* salida */
      .to([$('.core', el), $('.meta', el), $('.bar', el)], { opacity: 0, y: -20, duration: .5, ease: 'power2.in' }, 2.05)
      .to($('.seam', el), { scaleX: 1, duration: .55, ease: 'power3.inOut' }, 2.2)
      .add(() => res(), 2.6)
      .to($('.half.t', el), { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 2.65)
      .to($('.half.b', el), { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, 2.65)
      .to($('.seam', el), { opacity: 0, duration: .4 }, 2.75)
      .add(() => { el.remove(); document.documentElement.style.overflow = '' });
  });
}

/* ================= animaciones con GSAP (si cargó) ================= */
function splitText(el) {
  if (el._split) return; el._split = 1;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { frag.append(' '); return } const s = document.createElement('span'); s.className = 'w'; s.innerHTML = `<span>${esc(w)}</span>`; frag.append(s) });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
  };
  walk(el); el.classList.add('split');
}
E.animate = (root = document) => {
  const g = window.gsap, ST = window.ScrollTrigger;
  if (!g || !ST || reduce) return;
  const below = el => el.getBoundingClientRect().top > innerHeight * .92;
  /* Las transiciones CSS de transform pelean con GSAP y dejan elementos a medio camino:
     se apagan durante la animación y al terminar se limpian los estilos. */
  const from = (targets, vars, trigger, start = 'top 88%') => {
    const els = [].concat(targets);
    const tw = { ...vars, immediateRender: true,
      onStart() { els.forEach(e => { e._tr = e.style.transition; e.style.transition = 'none' }) },
      onComplete() { els.forEach(e => { e.style.transition = e._tr || '' }); g.set(els, { clearProps: 'transform,opacity,visibility' }) } };
    if (trigger) tw.scrollTrigger = { trigger, start, once: true };
    return g.from(els, tw);
  };
  $$('[data-split]', root).forEach(el => {
    splitText(el); const w = $$('.w > span', el);
    const tw = { yPercent: 118, rotate: 5, duration: 1.25, stagger: .055, ease: 'expo.out' };
    below(el) ? from(w, tw, el) : from(w, { ...tw, delay: .1 });
  });
  $$('[data-reveal]', root).forEach(el => {
    const d = +el.dataset.reveal || 0, tw = { y: 40, autoAlpha: 0, duration: 1.15, ease: 'expo.out' };
    below(el) ? from(el, { ...tw, delay: d * .6 }, el, 'top 92%') : from(el, { ...tw, delay: .25 + d });
  });
  $$('[data-stagger]', root).forEach(el => {
    const kids = [...el.children]; if (!kids.length) return;
    const tw = { y: 46, autoAlpha: 0, duration: 1.1, stagger: .085, ease: 'expo.out' };
    below(el) ? from(kids, tw, el) : from(kids, { ...tw, delay: .3 });
  });
  /* barra de progreso de lectura */
  const pb = $('#progress'); if (pb) g.to(pb, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 } });
  $$('.reveal-img', root).forEach(el => {
    const img = $('img,video', el);
    g.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } });
    if (img) g.fromTo(img, { scale: 1.35 }, { scale: 1.08, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('[data-parallax]', root).forEach(el => g.to(el, { yPercent: (+el.dataset.parallax) * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('[data-count]', root).forEach(el => {
    const to = +el.dataset.count, o = { v: 0 };
    g.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(o.v) + (el.dataset.suffix || '') });
  });
  $$('[data-line]', root).forEach(el => g.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%' } }));
  ST.refresh();
};
/* tarjetas que llegan después (filtros) */
E.animateCards = list => {
  if (reduce) return;
  list.forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(30px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: Math.min(i, 12) * 45, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' }));
};

function smooth() {
  if (reduce || !window.Lenis || !fine) return;
  lenis = new Lenis({ lerp: .1, wheelMultiplier: 1 });
  E.lenis = lenis;
  if (window.ScrollTrigger) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0) }
  else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf) })();
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href').length > 1) { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -90 }) } } });
}

/* ================= arranque ================= */
async function boot() {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const introP = E.introDone = intro();
  await loadData();
  chrome(); wireWa(); bindGlobal(); renderCart(); pointerFx(); transitions(); smooth();
  isReady = true; readyFns.forEach(fn => fn(E.data)); readyFns = [];
  wireWa();
  await introP;
  E.animate();
  document.documentElement.classList.add('ready');
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
