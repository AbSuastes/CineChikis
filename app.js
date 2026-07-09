/* ═══════════════════════════════════════════════════
   CINECHIQUIS · app.js
   Simulador infantil de cine · 100 % frontend
   Sin backend · Estado en localStorage · TMDB opcional
   ═══════════════════════════════════════════════════ */

"use strict";

/* ───────── Utilidades cortas ───────── */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function brindis(msg) {
  const b = $("#brindis");
  b.textContent = msg;
  b.classList.add("visible");
  clearTimeout(brindis._t);
  brindis._t = setTimeout(() => b.classList.remove("visible"), 2600);
}

/* ───────── Constantes del juego ───────── */
const HORARIOS = ["12:00", "14:30", "17:00", "19:30"];
const SALAS = ["Sala Arcoíris 🌈", "Sala Estrellita ⭐", "Sala Dulce 🍭"];
const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

const TIPOS_BOLETO = [
  { id: "infantil", nombre: "👧 Infantil", precio: 3 },
  { id: "adulto",   nombre: "🧑 Adulto",   precio: 5 },
  { id: "invitado", nombre: "🧸 Invitado", precio: 4 },
];

const PRODUCTOS = [
  { id: "palomitas", emoji: "🍿", nombre: "Palomitas gigantes", precio: 4 },
  { id: "refresco",  emoji: "🥤", nombre: "Refresco burbujitas", precio: 2 },
  { id: "jugo",      emoji: "🧃", nombre: "Juguito de frutas",   precio: 2 },
  { id: "nachos",    emoji: "🧀", nombre: "Nachos con quesito",  precio: 3 },
  { id: "dulces",    emoji: "🍬", nombre: "Bolsita de dulces",   precio: 2 },
  { id: "chocolate", emoji: "🍫", nombre: "Chocolate mágico",    precio: 2 },
  { id: "hotdog",    emoji: "🌭", nombre: "Hot dog feliz",       precio: 3 },
  { id: "helado",    emoji: "🍦", nombre: "Helado arcoíris",     precio: 3 },
  { id: "combo1",    emoji: "🎁", nombre: "Combo Chiquis (palomitas + jugo)", precio: 5 },
  { id: "combo2",    emoji: "🎉", nombre: "Combo Fiesta (nachos + refresco + dulces)", precio: 6 },
];

const MENSAJES_BOLETO = [
  "¡Que disfrutes la película! 🌟",
  "¡Palomitas listas y a soñar! 🍿",
  "¡Hoy eres la estrella del cine! ⭐",
  "¡Sonríe, empieza la función! 😄",
  "¡Magia de película para ti! ✨",
];

const CHIPS_SUGERIDAS = [
  "Frozen", "Encanto", "Moana", "Toy Story", "Coco",
  "Inside Out", "Finding Nemo", "The Lion King", "Ratatouille", "Monsters Inc",
];

/* Cartelera de juguete para el MODO DEMO (sin API key).
   Solo usa texto y emojis, no imágenes con derechos. */
const PELIS_DEMO = [
  { id: "d1",  titulo: "La Princesa de las Palomitas", emoji: "👑", anio: 2024, calif: 9.2, duracion: 88,  descripcion: "Una princesa descubre que su castillo está hecho de palomitas y debe protegerlo de un dragón hambriento." },
  { id: "d2",  titulo: "El Gatito Astronauta",         emoji: "🐱", anio: 2025, calif: 8.7, duracion: 92,  descripcion: "Michi viaja a la luna en un cohete de cartón y hace amigos estelares por todo el espacio." },
  { id: "d3",  titulo: "Aventuras en Villa Caramelo",  emoji: "🍭", anio: 2023, calif: 8.9, duracion: 95,  descripcion: "Tres amigas recorren un pueblo de dulces buscando la receta secreta del chocolate arcoíris." },
  { id: "d4",  titulo: "El Bosque que Canta",          emoji: "🌳", anio: 2024, calif: 9.0, duracion: 100, descripcion: "Los árboles de un bosque mágico cantan cada noche, hasta que un día se quedan sin voz." },
  { id: "d5",  titulo: "Sirenitas al Rescate",         emoji: "🧜‍♀️", anio: 2025, calif: 8.5, duracion: 84, descripcion: "Un equipo de sirenitas valientes salva el arrecife de coral con burbujas brillantes." },
  { id: "d6",  titulo: "Robotina y su Perrito",        emoji: "🤖", anio: 2023, calif: 8.8, duracion: 90,  descripcion: "Una robot inventora construye un perrito de tuercas que aprende a mover la colita." },
  { id: "d7",  titulo: "El Circo de las Nubes",        emoji: "🎪", anio: 2024, calif: 9.1, duracion: 86,  descripcion: "Un circo volador aterriza en la ciudad y todos los niños aprenden trucos de nube." },
  { id: "d8",  titulo: "Dino Fiesta",                  emoji: "🦕", anio: 2025, calif: 8.6, duracion: 93,  descripcion: "Los dinosaurios organizan la fiesta de cumpleaños más grande de la prehistoria." },
];

/* ───────── Estado + localStorage ───────── */
const CLAVE_ESTADO = "cinechiquis_estado_v1";
const CLAVE_TOKEN  = "cinechiquis_token_tmdb";
const CLAVE_MODO_DEMO = "cinechiquis_modo_demo"; // "1" = forzar cartelera de juguete

/* Token de lectura (v4) de TMDB incluido de fábrica.
   Es de solo lectura y gratuito; puede reemplazarse desde la Configuración. */
const TOKEN_POR_DEFECTO = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YzE0YmI3ZDc2OGE1ZjhjNTBmYTQwZGZiZTM3M2ViYiIsIm5iZiI6MTc4MzM3MzE1MS4xNTY5OTk4LCJzdWIiOiI2YTRjMWQ1ZmUxMzgwNDAxMTU4Mzc3MGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.iPia_e_XLaNxzz0h0ECRGJC4ksqkpcr1X5paEFJ9heg";

const estadoInicial = () => ({
  rol: null,
  boletos: [],                 // boletos vendidos { codigo, pelicula, sala, horario, asiento, tipo, precio, mensaje, usado }
  asientosOcupados: {},        // { claveFuncion: ["A1","B3", …] }
  pedidosCafe: [],             // tickets de cafetería
  contadorPedidos: 0,
  monedasGanadas: 0,
  carrito: {
    boletos: null,             // { pelicula, sala, horario, claveFuncion, asientos: [{asiento, tipo}] }
    cafe: {},                  // { idProducto: cantidad }
  },
});

let estado = cargarEstado();

function cargarEstado() {
  try {
    const crudo = localStorage.getItem(CLAVE_ESTADO);
    if (crudo) return { ...estadoInicial(), ...JSON.parse(crudo) };
  } catch (e) { console.warn("No se pudo leer el estado guardado:", e); }
  return estadoInicial();
}
function guardarEstado() {
  try { localStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado)); }
  catch (e) { console.warn("No se pudo guardar el estado:", e); }
}
function obtenerToken() {
  if (localStorage.getItem(CLAVE_MODO_DEMO) === "1") return "";      // demo forzado
  return localStorage.getItem(CLAVE_TOKEN) || TOKEN_POR_DEFECTO;      // propia o de fábrica
}
function guardarToken(t) {
  localStorage.removeItem(CLAVE_MODO_DEMO);
  t ? localStorage.setItem(CLAVE_TOKEN, t) : localStorage.removeItem(CLAVE_TOKEN);
}
function activarModoDemo() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.setItem(CLAVE_MODO_DEMO, "1");
}

/* ───────── Navegación entre vistas ───────── */
function mostrarVista(id) {
  $$(".vista").forEach((v) => v.classList.toggle("activa", v.id === id));
  $$(".nav-btn").forEach((b) => b.classList.toggle("activo", b.dataset.ir === id));
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Renderizar al entrar
  if (id === "vista-cartelera" && !mostrarVista._carteleraLista) { cargarCarteleraInicial(); }
  if (id === "vista-cafeteria")  renderCafeteria();
  if (id === "vista-carrito")    renderCarrito();
  if (id === "vista-validacion") renderListaValidacion();
  if (id === "vista-admin")      renderAdmin();
  if (id === "vista-config")     renderConfig();
}

/* ───────── TMDB ───────── */
async function tmdb(ruta, params = {}) {
  const token = obtenerToken();
  const url = new URL("https://api.themoviedb.org/3" + ruta);
  const p = { language: "es-MX", include_adult: "false", ...params };
  const esTokenV4 = token.startsWith("eyJ"); // los tokens de lectura v4 son JWT
  if (!esTokenV4) p.api_key = token;
  Object.entries(p).forEach(([k, v]) => url.searchParams.set(k, v));
  const opciones = esTokenV4 ? { headers: { Authorization: "Bearer " + token } } : {};
  const resp = await fetch(url, opciones);
  if (!resp.ok) throw new Error("TMDB respondió " + resp.status);
  return resp.json();
}

const URL_POSTER = "https://image.tmdb.org/t/p/w342"; // CDN de imágenes de TMDB
const cacheDuraciones = {};

/* ───────── Filtro de clasificación "A" ─────────
   Solo se muestran películas aptas para todo público:
   AA / A (México, RTC) o su equivalente G (EUA) cuando
   la película no tiene registrada la clasificación mexicana. */
const CLASIFICACIONES_PERMITIDAS = new Set(["AA", "A", "G"]);
const cacheClasificaciones = {};

async function obtenerClasificacion(idTmdb) {
  if (cacheClasificaciones[idTmdb] !== undefined) return cacheClasificaciones[idTmdb];
  try {
    const datos = await tmdb(`/movie/${idTmdb}/release_dates`);
    const certDe = (iso) => {
      const pais = (datos.results || []).find((r) => r.iso_3166_1 === iso);
      const con = pais && pais.release_dates.find((d) => d.certification && d.certification.trim());
      return con ? con.certification.trim().toUpperCase() : "";
    };
    const cert = certDe("MX") || certDe("US");
    cacheClasificaciones[idTmdb] = cert;
    return cert;
  } catch {
    return (cacheClasificaciones[idTmdb] = "");
  }
}

async function soloClasificacionA(lista) {
  const certs = await Promise.all(lista.map((p) => obtenerClasificacion(p.idTmdb)));
  return lista.filter((p, i) => {
    p.clasificacion = certs[i];
    return CLASIFICACIONES_PERMITIDAS.has(certs[i]);
  });
}

function normalizarPeliTMDB(m) {
  return {
    id: "t" + m.id,
    idTmdb: m.id,
    titulo: m.title || m.original_title || "Sin título",
    poster: m.poster_path ? URL_POSTER + m.poster_path : null,
    emoji: "🎬",
    anio: (m.release_date || "").slice(0, 4) || "—",
    calif: m.vote_average || 0,
    duracion: null,
    clasificacion: "",
    descripcion: m.overview || "Una película llena de sorpresas. 🌟",
  };
}

/* ───────── Cartelera ───────── */
let peliculasActuales = [];
let peliculaElegida = null;
let funcionElegida = null;
let asientosElegidos = [];

async function cargarCarteleraInicial() {
  mostrarVista._carteleraLista = true;
  const aviso = $("#aviso-cartelera");
  if (!obtenerToken()) {
    aviso.innerHTML = "🧸 Estás en <strong>modo demo</strong> con películas de juguete. Para volver a las películas reales, ve a la <button class='chip' data-ir='vista-config'>⚙️ configuración</button>.";
    peliculasActuales = PELIS_DEMO;
    renderPeliculas();
    conectarBotonesIr(aviso);
    return;
  }
  aviso.textContent = "Buscando películas clasificación A… 🔎";
  try {
    // 1º intento: TMDB filtra en el servidor por clasificación mexicana (RTC ≤ A)
    const datos = await tmdb("/discover/movie", {
      with_genres: "16,10751",
      sort_by: "popularity.desc",
      region: "MX",
      certification_country: "MX",
      "certification.lte": "A",
    });
    peliculasActuales = (datos.results || []).slice(0, 12).map(normalizarPeliTMDB);
    peliculasActuales.forEach((p) => { p.clasificacion = "A"; });

    // Respaldo: si TMDB tiene pocas películas con clasificación MX registrada,
    // buscamos sin ese filtro y verificamos una por una (acepta AA/A o G de EUA).
    if (peliculasActuales.length < 4) {
      const datos2 = await tmdb("/discover/movie", {
        with_genres: "16,10751",
        sort_by: "popularity.desc",
        region: "MX",
      });
      const candidatas = (datos2.results || []).slice(0, 20).map(normalizarPeliTMDB);
      peliculasActuales = (await soloClasificacionA(candidatas)).slice(0, 12);
    }
    aviso.textContent = peliculasActuales.length
      ? "🅰️ Mostrando solo películas clasificación A (aptas para todo público)."
      : "No encontré películas clasificación A. Intenta buscar una. 🔍";
  } catch (e) {
    aviso.textContent = "😿 No pude conectar con TMDB (" + e.message + "). Mostraré la cartelera de juguete.";
    peliculasActuales = PELIS_DEMO;
  }
  renderPeliculas();
}

async function buscarPeliculas(texto) {
  const aviso = $("#aviso-cartelera");
  if (!texto.trim()) return;
  if (!obtenerToken()) {
    // Búsqueda simple dentro del modo demo
    const t = texto.toLowerCase();
    peliculasActuales = PELIS_DEMO.filter((p) => p.titulo.toLowerCase().includes(t));
    aviso.textContent = peliculasActuales.length
      ? ""
      : "En modo demo no encontré esa película. Configura TMDB para buscar películas reales. ⚙️";
    if (!peliculasActuales.length) peliculasActuales = PELIS_DEMO;
    renderPeliculas();
    return;
  }
  aviso.textContent = "Buscando “" + texto + "”… 🔎";
  try {
    const datos = await tmdb("/search/movie", { query: texto });
    const candidatas = (datos.results || []).slice(0, 20).map(normalizarPeliTMDB);
    aviso.textContent = "Revisando clasificaciones… 🅰️";
    peliculasActuales = (await soloClasificacionA(candidatas)).slice(0, 12);
    if (peliculasActuales.length) {
      aviso.textContent = "🅰️ Mostrando solo resultados clasificación A.";
    } else if (candidatas.length) {
      aviso.textContent = "🙈 Encontré películas con ese nombre, pero ninguna es clasificación A, así que no puedo mostrarlas en Cinechiquis.";
    } else {
      aviso.textContent = "No encontré nada con ese nombre. 🙈";
    }
  } catch (e) {
    aviso.textContent = "😿 Hubo un problema con la búsqueda: " + e.message;
  }
  renderPeliculas();
}

function estrellas(calif) {
  const n = Math.round((calif || 0) / 2);
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderPeliculas() {
  const cont = $("#rejilla-peliculas");
  cont.innerHTML = peliculasActuales.map((p) => `
    <article class="tarjeta-pelicula">
      ${p.poster
        ? `<img class="poster" src="${esc(p.poster)}" alt="Póster de ${esc(p.titulo)}" loading="lazy" />`
        : `<div class="poster-emoji" role="img" aria-label="${esc(p.titulo)}">${p.emoji}</div>`}
      <div class="cuerpo-pelicula">
        <h3>${esc(p.titulo)}</h3>
        <div class="datos-pelicula">📅 ${esc(p.anio)} ${p.duracion ? "· ⏱️ " + p.duracion + " min" : ""} · <span class="insignia-a" title="Apta para todo público">${esc(p.clasificacion || "A")}</span></div>
        <div class="estrellas" title="Calificación ${p.calif}">${estrellas(p.calif)}</div>
        <p class="descripcion">${esc(p.descripcion)}</p>
        <button class="boton primario" data-peli="${esc(p.id)}">🎟️ Elegir función</button>
      </div>
    </article>
  `).join("") || "<p class='nota'>No hay películas para mostrar. 🙈</p>";

  $$("#rejilla-peliculas [data-peli]").forEach((b) =>
    b.addEventListener("click", () => elegirPelicula(b.dataset.peli)));
}

/* ───────── 5. Selección de función ───────── */
async function elegirPelicula(id) {
  peliculaElegida = peliculasActuales.find((p) => p.id === id);
  if (!peliculaElegida) return;

  // Duración desde TMDB (una sola vez por película)
  if (peliculaElegida.idTmdb && !peliculaElegida.duracion) {
    if (cacheDuraciones[peliculaElegida.idTmdb]) {
      peliculaElegida.duracion = cacheDuraciones[peliculaElegida.idTmdb];
    } else {
      try {
        const det = await tmdb("/movie/" + peliculaElegida.idTmdb);
        peliculaElegida.duracion = det.runtime || null;
        cacheDuraciones[peliculaElegida.idTmdb] = peliculaElegida.duracion;
      } catch { /* sin duración, no pasa nada */ }
    }
  }

  $("#ficha-pelicula").innerHTML = `
    ${peliculaElegida.poster
      ? `<img src="${esc(peliculaElegida.poster)}" alt="" />`
      : `<div class="poster-emoji">${peliculaElegida.emoji}</div>`}
    <div>
      <h3 style="font-family:var(--fuente-titulos);margin:0">${esc(peliculaElegida.titulo)}</h3>
      <p class="nota">📅 ${esc(peliculaElegida.anio)} ${peliculaElegida.duracion ? "· ⏱️ " + peliculaElegida.duracion + " min" : ""} · <span class="insignia-a">${esc(peliculaElegida.clasificacion || "A")}</span> · <span class="estrellas">${estrellas(peliculaElegida.calif)}</span></p>
    </div>`;

  $("#rejilla-funciones").innerHTML = HORARIOS.map((h, i) => `
    <button class="tarjeta-funcion" data-hora="${h}" data-sala="${esc(SALAS[i % SALAS.length])}">
      <div class="hora">🕐 ${h}</div>
      <div class="sala">${esc(SALAS[i % SALAS.length])}</div>
    </button>`).join("");

  $$("#rejilla-funciones .tarjeta-funcion").forEach((b) =>
    b.addEventListener("click", () => elegirFuncion(b.dataset.hora, b.dataset.sala)));

  mostrarVista("vista-funcion");
}

function claveFuncion(peli, hora, sala) {
  return `${peli.id}|${hora}|${sala}`;
}

/* Generador pseudoaleatorio con semilla: los asientos "ocupados de fábrica"
   son siempre los mismos para cada función. */
function generadorSemilla(texto) {
  let s = 0;
  for (const c of texto) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
}

function asientosPreocupados(clave) {
  const azar = generadorSemilla(clave);
  const lista = [];
  for (const f of FILAS) for (let c = 1; c <= COLUMNAS; c++) {
    if (azar() < 0.18) lista.push(f + c);
  }
  return lista;
}

/* ───────── 6. Asientos ───────── */
function elegirFuncion(hora, sala) {
  funcionElegida = { hora, sala, clave: claveFuncion(peliculaElegida, hora, sala) };
  asientosElegidos = [];
  $("#detalle-funcion").textContent =
    `${peliculaElegida.titulo} · ${sala} · ${hora}`;
  renderAsientos();
  mostrarVista("vista-asientos");
}

function renderAsientos() {
  const ocupadosGuardados = estado.asientosOcupados[funcionElegida.clave] || [];
  const ocupados = new Set([...asientosPreocupados(funcionElegida.clave), ...ocupadosGuardados]);

  $("#mapa-asientos").innerHTML = FILAS.map((f) => `
    <div class="fila-sala">
      <span class="letra-fila">${f}</span>
      ${Array.from({ length: COLUMNAS }, (_, i) => {
        const id = f + (i + 1);
        const ocupado = ocupados.has(id);
        const elegido = asientosElegidos.includes(id);
        return `<button class="asiento ${ocupado ? "ocupado" : elegido ? "elegido" : ""}"
                  data-asiento="${id}" ${ocupado ? "disabled" : ""}
                  aria-label="Asiento ${id}${ocupado ? " ocupado" : ""}">${i + 1}</button>`;
      }).join("")}
      <span class="letra-fila">${f}</span>
    </div>`).join("");

  $$("#mapa-asientos .asiento:not(.ocupado)").forEach((b) =>
    b.addEventListener("click", () => alternarAsiento(b.dataset.asiento)));

  const n = asientosElegidos.length;
  $("#resumen-asientos").textContent = n
    ? `Elegiste ${n} asiento${n > 1 ? "s" : ""}: ${asientosElegidos.join(", ")} 💜`
    : "Toca los asientos que quieras 💜";
  $("#btn-continuar-boletos").disabled = n === 0;
}

function alternarAsiento(id) {
  const i = asientosElegidos.indexOf(id);
  if (i >= 0) asientosElegidos.splice(i, 1);
  else if (asientosElegidos.length >= 8) { brindis("¡Máximo 8 asientos por compra! 🙈"); return; }
  else asientosElegidos.push(id);
  asientosElegidos.sort();
  renderAsientos();
}

/* ───────── 7. Tipos de boleto ───────── */
let tiposPorAsiento = {};

function abrirTipos() {
  tiposPorAsiento = Object.fromEntries(asientosElegidos.map((a) => [a, "infantil"]));
  renderTipos();
  mostrarVista("vista-tipos");
}

function renderTipos() {
  $("#lista-tipos").innerHTML = asientosElegidos.map((a) => `
    <div class="fila-tipo">
      <span class="asiento-nombre">💺 ${a}</span>
      <span class="opciones-tipo">
        ${TIPOS_BOLETO.map((t) => `
          <button class="opcion-tipo ${tiposPorAsiento[a] === t.id ? "activa" : ""}"
            data-asiento="${a}" data-tipo="${t.id}">${t.nombre} · ${t.precio} 🪙</button>`).join("")}
      </span>
    </div>`).join("");

  $$("#lista-tipos .opcion-tipo").forEach((b) =>
    b.addEventListener("click", () => {
      tiposPorAsiento[b.dataset.asiento] = b.dataset.tipo;
      renderTipos();
    }));

  const total = asientosElegidos.reduce(
    (s, a) => s + TIPOS_BOLETO.find((t) => t.id === tiposPorAsiento[a]).precio, 0);
  $("#total-boletos").innerHTML = `Total de boletos: <strong>${total} 🪙</strong>`;
}

function agregarBoletosAlCarrito() {
  estado.carrito.boletos = {
    pelicula: peliculaElegida.titulo,
    sala: funcionElegida.sala,
    horario: funcionElegida.hora,
    claveFuncion: funcionElegida.clave,
    asientos: asientosElegidos.map((a) => ({ asiento: a, tipo: tiposPorAsiento[a] })),
  };
  guardarEstado();
  actualizarGlobito();
  brindis("🎟️ ¡Boletos agregados al carrito!");
  mostrarVista("vista-carrito");
}

/* ───────── 9. Cafetería ───────── */
function renderCafeteria() {
  $("#rejilla-productos").innerHTML = PRODUCTOS.map((p) => {
    const cant = estado.carrito.cafe[p.id] || 0;
    return `
    <article class="tarjeta-producto">
      <span class="emoji">${p.emoji}</span>
      <h3>${esc(p.nombre)}</h3>
      <span class="precio">${p.precio} 🪙</span>
      <div class="contador">
        <button data-menos="${p.id}" aria-label="Quitar uno">−</button>
        <span class="cantidad">${cant}</span>
        <button data-mas="${p.id}" aria-label="Agregar uno">+</button>
      </div>
    </article>`;
  }).join("");

  $$("#rejilla-productos [data-mas]").forEach((b) =>
    b.addEventListener("click", () => cambiarProducto(b.dataset.mas, +1)));
  $$("#rejilla-productos [data-menos]").forEach((b) =>
    b.addEventListener("click", () => cambiarProducto(b.dataset.menos, -1)));
}

function cambiarProducto(id, delta) {
  const actual = estado.carrito.cafe[id] || 0;
  const nuevo = Math.max(0, Math.min(9, actual + delta));
  if (nuevo === 0) delete estado.carrito.cafe[id];
  else estado.carrito.cafe[id] = nuevo;
  guardarEstado();
  renderCafeteria();
  actualizarGlobito();
}

/* ───────── 10. Carrito ───────── */
function subtotales() {
  const b = estado.carrito.boletos;
  const subBoletos = b
    ? b.asientos.reduce((s, x) => s + TIPOS_BOLETO.find((t) => t.id === x.tipo).precio, 0)
    : 0;
  const subCafe = Object.entries(estado.carrito.cafe).reduce((s, [id, cant]) => {
    const p = PRODUCTOS.find((x) => x.id === id);
    return s + (p ? p.precio * cant : 0);
  }, 0);
  return { subBoletos, subCafe, total: subBoletos + subCafe };
}

function actualizarGlobito() {
  const b = estado.carrito.boletos ? estado.carrito.boletos.asientos.length : 0;
  const c = Object.values(estado.carrito.cafe).reduce((s, n) => s + n, 0);
  const total = b + c;
  const globito = $("#globito-carrito");
  globito.hidden = total === 0;
  globito.textContent = total;
}

function renderCarrito() {
  const { subBoletos, subCafe, total } = subtotales();
  const b = estado.carrito.boletos;
  let html = "";

  if (b) {
    html += `<div class="tarjeta">
      <h3>🎟️ Boletos · ${esc(b.pelicula)}</h3>
      <p class="nota">${esc(b.sala)} · ${esc(b.horario)}</p>
      ${b.asientos.map((x) => {
        const t = TIPOS_BOLETO.find((y) => y.id === x.tipo);
        return `<div class="linea-carrito"><span>💺 ${x.asiento} · ${t.nombre}</span><span>${t.precio} 🪙</span></div>`;
      }).join("")}
      <div class="linea-carrito"><strong>Subtotal boletos</strong><strong>${subBoletos} 🪙</strong></div>
      <button class="boton mini peligro" id="btn-quitar-boletos">Quitar boletos</button>
    </div>`;
  }

  const entradasCafe = Object.entries(estado.carrito.cafe);
  if (entradasCafe.length) {
    html += `<div class="tarjeta">
      <h3>🍿 Dulcería</h3>
      ${entradasCafe.map(([id, cant]) => {
        const p = PRODUCTOS.find((x) => x.id === id);
        return `<div class="linea-carrito"><span>${p.emoji} ${esc(p.nombre)} × ${cant}</span><span>${p.precio * cant} 🪙</span></div>`;
      }).join("")}
      <div class="linea-carrito"><strong>Subtotal dulcería</strong><strong>${subCafe} 🪙</strong></div>
    </div>`;
  }

  if (!b && !entradasCafe.length) {
    html = `<div class="tarjeta centrado"><p style="text-align:center;font-weight:800">Tu carrito está vacío 🛒<br>¡Ve por boletos o golosinas!</p>
      <div class="fila-botones" style="justify-content:center">
        <button class="boton primario" data-ir="vista-cartelera">🎬 Cartelera</button>
        <button class="boton" data-ir="vista-cafeteria">🍿 Dulcería</button>
      </div></div>`;
  } else {
    html += `<div class="tarjeta"><div class="linea-carrito linea-total"><span>Total a pagar</span><span>${total} 🪙</span></div></div>`;
  }

  $("#contenido-carrito").innerHTML = html;
  $("#zona-pago").hidden = !(b || entradasCafe.length);
  $("#campo-monedas").value = "";
  $("#mensaje-cambio").textContent = "";
  conectarBotonesIr($("#contenido-carrito"));
  const quitar = $("#btn-quitar-boletos");
  if (quitar) quitar.addEventListener("click", () => {
    estado.carrito.boletos = null;
    guardarEstado(); actualizarGlobito(); renderCarrito();
  });
}

function revisarCambio() {
  const { total } = subtotales();
  const monedas = parseInt($("#campo-monedas").value, 10);
  const msg = $("#mensaje-cambio");
  if (isNaN(monedas)) { msg.textContent = ""; return null; }
  if (monedas < total) {
    msg.textContent = `Te faltan ${total - monedas} moneditas 🪙`;
    msg.className = "nota mal";
    return null;
  }
  const cambio = monedas - total;
  msg.textContent = cambio === 0 ? "¡Pago exacto! 🌟" : `Tu cambio: ${cambio} moneditas 🪙`;
  msg.className = "nota bien";
  return { monedas, cambio };
}

/* ───────── Pago: genera boletos y ticket ───────── */
function codigoBoleto() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 4; i++) c += letras[Math.floor(Math.random() * letras.length)];
  return "CHIQ-" + c;
}

function pagar() {
  const pago = revisarCambio();
  const { total, subBoletos, subCafe } = subtotales();
  if (total === 0) return;
  if (!pago) { brindis("Escribe cuántas moneditas entregas 🪙"); return; }

  const b = estado.carrito.boletos;
  let boletosNuevos = [];

  if (b) {
    // Marcar asientos como ocupados
    const lista = estado.asientosOcupados[b.claveFuncion] || [];
    b.asientos.forEach((x) => { if (!lista.includes(x.asiento)) lista.push(x.asiento); });
    estado.asientosOcupados[b.claveFuncion] = lista;

    // Crear boletos
    boletosNuevos = b.asientos.map((x) => {
      const t = TIPOS_BOLETO.find((y) => y.id === x.tipo);
      return {
        codigo: codigoBoleto(),
        pelicula: b.pelicula,
        sala: b.sala,
        horario: b.horario,
        asiento: x.asiento,
        tipo: t.nombre,
        precio: t.precio,
        mensaje: MENSAJES_BOLETO[Math.floor(Math.random() * MENSAJES_BOLETO.length)],
        usado: false,
      };
    });
    estado.boletos.push(...boletosNuevos);
  }

  let pedidoNuevo = null;
  const entradasCafe = Object.entries(estado.carrito.cafe);
  if (entradasCafe.length) {
    estado.contadorPedidos += 1;
    pedidoNuevo = {
      numero: estado.contadorPedidos,
      fecha: new Date().toLocaleString("es-MX"),
      lineas: entradasCafe.map(([id, cant]) => {
        const p = PRODUCTOS.find((x) => x.id === id);
        return { emoji: p.emoji, nombre: p.nombre, cantidad: cant, importe: p.precio * cant };
      }),
      total: subCafe,
    };
    estado.pedidosCafe.push(pedidoNuevo);
  }

  estado.monedasGanadas += total;
  estado.carrito = { boletos: null, cafe: {} };
  guardarEstado();
  actualizarGlobito();
  brindis(pago.cambio ? `¡Gracias! Tu cambio: ${pago.cambio} 🪙` : "¡Gracias por tu pago exacto! 🌟");

  if (boletosNuevos.length) {
    renderBoletos(boletosNuevos);
    mostrarVista("vista-boletos");
    if (pedidoNuevo) setTimeout(() => brindis("🧾 Tu ticket de dulcería te espera en la Oficina… ¡o revisa la vista de ticket!"), 2800);
  }
  if (pedidoNuevo) {
    renderTicketCafe(pedidoNuevo);
    if (!boletosNuevos.length) mostrarVista("vista-ticket-cafe");
  }
}

/* ───────── 8. Boletos con QR decorativo ───────── */
function renderBoletos(lista) {
  $("#lista-boletos").innerHTML = lista.map((b, i) => `
    <article class="boleto ${b.usado ? "usado" : ""}">
      <div class="encabezado"><span>🎬 CINECHIQUIS</span>${b.usado ? '<span class="sello-usado">USADO</span>' : ""}</div>
      <h3 class="pelicula">${esc(b.pelicula)}</h3>
      <div class="qr"><canvas id="qr-${i}" width="84" height="84"></canvas></div>
      <div class="dato">🏛️ <b>${esc(b.sala)}</b></div>
      <div class="dato">🕐 Función: <b>${esc(b.horario)}</b></div>
      <div class="dato">💺 Asiento: <b>${esc(b.asiento)}</b> · ${esc(b.tipo)}</div>
      <div class="dato">🎫 Código: <span class="codigo">${esc(b.codigo)}</span></div>
      <div class="mensaje">${esc(b.mensaje)}</div>
    </article>`).join("");

  // QR decorativo con la librería QRious (CDN); si no cargó, no pasa nada
  lista.forEach((b, i) => {
    const lienzo = document.getElementById("qr-" + i);
    if (lienzo && typeof QRious !== "undefined") {
      new QRious({ element: lienzo, value: `CINECHIQUIS|${b.codigo}|${b.asiento}`, size: 84, foreground: "#3A2354" });
    } else if (lienzo) {
      lienzo.replaceWith(Object.assign(document.createElement("div"), { textContent: "🎟️", style: "font-size:3rem" }));
    }
  });
}

/* ───────── 11. Ticket de cafetería ───────── */
function renderTicketCafe(pedido) {
  const p = pedido || estado.pedidosCafe[estado.pedidosCafe.length - 1];
  if (!p) {
    $("#zona-ticket-cafe").innerHTML = "<p class='nota' style='text-align:center'>Todavía no hay pedidos de dulcería. 🍿</p>";
    return;
  }
  $("#zona-ticket-cafe").innerHTML = `
    <div class="ticket-cafe">
      <h3>🍿 DULCERÍA CINECHIQUIS 🍿</h3>
      <p class="centrado">Pedido #${String(p.numero).padStart(3, "0")}<br>${esc(p.fecha)}</p>
      <div class="separador"></div>
      ${p.lineas.map((l) => `<div class="linea"><span>${l.emoji} ${esc(l.nombre)} ×${l.cantidad}</span><span>${l.importe} 🪙</span></div>`).join("")}
      <div class="separador"></div>
      <div class="linea grande"><span>TOTAL</span><span>${p.total} 🪙</span></div>
      <div class="separador"></div>
      <p class="centrado">🔔 Recoge tu pedido en el mostrador<br>cuando escuches tu número.<br>¡Buen provecho! 💜</p>
    </div>`;
}

/* ───────── 12. Validación de entrada ───────── */
function validarCodigo() {
  const codigo = $("#campo-codigo").value.trim().toUpperCase();
  const zona = $("#resultado-validacion");
  if (!codigo) { zona.innerHTML = ""; return; }
  const boleto = estado.boletos.find((b) => b.codigo === codigo);

  if (!boleto) {
    zona.innerHTML = `<div class="resultado-mal">❌ No encontré ningún boleto con el código <strong>${esc(codigo)}</strong>. Revisa que esté bien escrito.</div>`;
    return;
  }
  if (boleto.usado) {
    zona.innerHTML = `<div class="resultado-mal">⚠️ Este boleto <strong>ya fue usado</strong>.<br>${esc(boleto.pelicula)} · ${esc(boleto.sala)} · ${esc(boleto.horario)} · Asiento ${esc(boleto.asiento)}</div>`;
    return;
  }
  zona.innerHTML = `
    <div class="resultado-ok">
      ✅ ¡Boleto válido!<br>
      🎬 <strong>${esc(boleto.pelicula)}</strong><br>
      🏛️ ${esc(boleto.sala)} · 🕐 ${esc(boleto.horario)} · 💺 Asiento ${esc(boleto.asiento)} · ${esc(boleto.tipo)}<br><br>
      <button class="boton primario" id="btn-marcar-usado">🔦 ¡Adelante! Marcar como usado</button>
    </div>`;
  $("#btn-marcar-usado").addEventListener("click", () => {
    boleto.usado = true;
    guardarEstado();
    zona.innerHTML = `<div class="resultado-ok">🌟 ¡Que disfrutes la película! El boleto quedó marcado como usado.</div>`;
    renderListaValidacion();
  });
}

function renderListaValidacion() {
  const cont = $("#lista-validacion");
  if (!estado.boletos.length) {
    cont.innerHTML = "<p class='nota'>Todavía no se han vendido boletos hoy. 🎟️</p>";
    return;
  }
  cont.innerHTML = [...estado.boletos].reverse().map((b) => `
    <div class="mini-boleto ${b.usado ? "esta-usado" : ""}">
      <div class="info-mini">
        <span>🎫 <span class="codigo">${esc(b.codigo)}</span> ${b.usado ? "🔴 Usado" : "🟢 Sin usar"}</span>
        <span>${esc(b.pelicula)}</span>
        <span class="nota">🏛️ ${esc(b.sala)} · 🕐 ${esc(b.horario)} · 💺 ${esc(b.asiento)} · ${esc(b.tipo)}</span>
      </div>
      <button class="boton mini ${b.usado ? "" : "primario"}" data-alternar="${esc(b.codigo)}">
        ${b.usado ? "↩️ Cancelar uso" : "🔦 Usar boleto"}
      </button>
    </div>`).join("");

  cont.querySelectorAll("[data-alternar]").forEach((btn) =>
    btn.addEventListener("click", () => alternarUsoBoleto(btn.dataset.alternar)));
}

function alternarUsoBoleto(codigo) {
  const boleto = estado.boletos.find((b) => b.codigo === codigo);
  if (!boleto) return;
  boleto.usado = !boleto.usado;
  guardarEstado();
  brindis(boleto.usado
    ? `🔦 Boleto ${boleto.codigo} usado. ¡Adelante, asiento ${boleto.asiento}! 🌟`
    : `↩️ Boleto ${boleto.codigo} vuelve a estar disponible.`);
  renderListaValidacion();
}

/* ───────── 13 + Admin ───────── */
function renderAdmin() {
  const usados = estado.boletos.filter((b) => b.usado).length;
  $("#rejilla-stats").innerHTML = `
    <div class="stat"><div class="numero">${estado.boletos.length}</div><div class="etiqueta">🎟️ Boletos vendidos</div></div>
    <div class="stat"><div class="numero">${usados}</div><div class="etiqueta">🔦 Boletos usados</div></div>
    <div class="stat"><div class="numero">${estado.pedidosCafe.length}</div><div class="etiqueta">🍿 Pedidos de dulcería</div></div>
    <div class="stat"><div class="numero">${estado.monedasGanadas} 🪙</div><div class="etiqueta">💰 Moneditas ganadas</div></div>`;
}

function reiniciarTodo() {
  if (!confirm("¿Segura que quieres reiniciar todo el cine? Se borrarán boletos, pedidos y asientos ocupados.")) return;
  const rol = estado.rol;
  estado = estadoInicial();
  estado.rol = rol;
  guardarEstado();
  actualizarGlobito();
  renderAdmin();
  brindis("🧹 ¡El cine quedó como nuevo!");
}

/* ───────── 2. Configuración de TMDB ───────── */
function renderConfig() {
  const propia = localStorage.getItem(CLAVE_TOKEN);
  const demo = localStorage.getItem(CLAVE_MODO_DEMO) === "1";
  $("#campo-token").value = propia || "";
  $("#estado-token").textContent = demo
    ? "🧸 Modo demo activado: cartelera de juguete."
    : propia
      ? "✅ Estás usando tu propia clave guardada en este navegador."
      : "🎬 Estás usando la clave incluida de Cinechiquis. Puedes reemplazarla con la tuya si quieres.";
}

async function probarToken() {
  const estadoTxt = $("#estado-token");
  const valor = $("#campo-token").value.trim();
  if (valor) guardarToken(valor);            // probar la clave escrita
  else localStorage.removeItem(CLAVE_MODO_DEMO); // sin texto: probar la clave efectiva (propia o de fábrica)
  estadoTxt.textContent = "Probando conexión… ⏳";
  try {
    await tmdb("/configuration");
    estadoTxt.textContent = "🎉 ¡Conexión exitosa! Ya puedes ver películas reales.";
    mostrarVista._carteleraLista = false; // recargar cartelera con la nueva clave
  } catch (e) {
    estadoTxt.textContent = "😿 No funcionó (" + e.message + "). Revisa que la clave esté completa.";
  }
}

/* ───────── Roles ───────── */
const NOMBRES_ROL = {
  cliente: "👧 Cliente",
  taquillera: "🎟️ Taquillera",
  cafeteria: "🍿 Encargada de cafetería",
  acomodadora: "🔦 Acomodadora",
  administradora: "👩‍💼 Administradora",
};
const VISTA_POR_ROL = {
  cliente: "vista-cartelera",
  taquillera: "vista-cartelera",
  cafeteria: "vista-cafeteria",
  acomodadora: "vista-validacion",
  administradora: "vista-admin",
};

function elegirRol(rol) {
  estado.rol = rol;
  guardarEstado();
  $$(".tarjeta-rol").forEach((t) => t.classList.toggle("elegida", t.dataset.rol === rol));
  $("#barra-rol").hidden = false;
  $("#rol-actual").textContent = NOMBRES_ROL[rol];
  brindis(`¡Hola, ${NOMBRES_ROL[rol]}! 🎉`);
  setTimeout(() => mostrarVista(VISTA_POR_ROL[rol]), 500);
}

/* ───────── Conexión de eventos ───────── */
function conectarBotonesIr(raiz = document) {
  raiz.querySelectorAll("[data-ir]").forEach((b) => {
    if (b._conectado) return;
    b._conectado = true;
    b.addEventListener("click", () => mostrarVista(b.dataset.ir));
  });
}

function iniciar() {
  conectarBotonesIr();

  // Logo → inicio
  const logo = $("#btn-logo");
  logo.addEventListener("click", () => mostrarVista("vista-inicio"));
  logo.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") mostrarVista("vista-inicio"); });

  // Roles
  $$(".tarjeta-rol").forEach((t) => t.addEventListener("click", () => elegirRol(t.dataset.rol)));
  $("#btn-cambiar-rol").addEventListener("click", () => mostrarVista("vista-inicio"));
  if (estado.rol) {
    $("#barra-rol").hidden = false;
    $("#rol-actual").textContent = NOMBRES_ROL[estado.rol] || "👧 Cliente";
    $$(".tarjeta-rol").forEach((t) => t.classList.toggle("elegida", t.dataset.rol === estado.rol));
  }

  // Cartelera
  $("#btn-buscar").addEventListener("click", () => buscarPeliculas($("#campo-busqueda").value));
  $("#campo-busqueda").addEventListener("keydown", (e) => { if (e.key === "Enter") buscarPeliculas(e.target.value); });
  $("#chips-sugeridas").innerHTML = CHIPS_SUGERIDAS.map((c) => `<button class="chip">${esc(c)}</button>`).join("");
  $$("#chips-sugeridas .chip").forEach((b) =>
    b.addEventListener("click", () => { $("#campo-busqueda").value = b.textContent; buscarPeliculas(b.textContent); }));

  // Asientos → tipos → carrito
  $("#btn-continuar-boletos").addEventListener("click", abrirTipos);
  $("#btn-agregar-boletos").addEventListener("click", agregarBoletosAlCarrito);

  // Pago
  $("#campo-monedas").addEventListener("input", revisarCambio);
  $("#btn-pagar").addEventListener("click", pagar);

  // Validación
  $("#btn-validar").addEventListener("click", validarCodigo);
  $("#campo-codigo").addEventListener("keydown", (e) => { if (e.key === "Enter") validarCodigo(); });

  // Config
  $("#btn-guardar-token").addEventListener("click", () => {
    guardarToken($("#campo-token").value.trim());
    renderConfig();
    mostrarVista._carteleraLista = false;
    brindis("💾 ¡Guardado!");
  });
  $("#btn-probar-token").addEventListener("click", probarToken);
  $("#btn-borrar-token").addEventListener("click", () => {
    activarModoDemo();
    $("#campo-token").value = "";
    renderConfig();
    mostrarVista._carteleraLista = false;
    brindis("🧸 Modo demo activado: cartelera de juguete.");
  });

  // Admin
  $("#btn-reiniciar").addEventListener("click", reiniciarTodo);

  // Ticket café (por si entran directo)
  renderTicketCafe(null);

  actualizarGlobito();
}

document.addEventListener("DOMContentLoaded", iniciar);
