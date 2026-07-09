# 🎬 Cinechiquis

Simulador infantil de cine, 100 % frontend (HTML + CSS + JavaScript puro), pensado para publicarse en **GitHub Pages** sin backend, sin Node.js y sin base de datos.

Las niñas pueden jugar a:

- 🎟️ Comprar boletos y elegir la función (horarios y salas ficticias)
- 💺 Seleccionar asientos en una sala visual
- 🍿 Comprar en la dulcería con moneditas de juguete 🪙
- 🧾 Recibir boletos con QR decorativo y ticket de cafetería
- 🔦 Validar boletos en la entrada (rol de acomodadora)
- 👩‍💼 Ver estadísticas y reiniciar el cine (rol de administradora)

## 🔑 Películas reales con TMDB (opcional)

La app trae **incluida de fábrica una clave de TMDB** (token de lectura v4, en `app.js`), así que las películas y pósters reales funcionan desde el primer momento. Toma en cuenta que, al estar en el código de un sitio estático, esa clave queda visible para cualquiera que vea el repositorio o el sitio; es de solo lectura y gratuita, y puedes revocarla o cambiarla en tu cuenta de TMDB cuando quieras.

También hay un **modo demo** (botón 🧸 en la Configuración) con cartelera de juguete, y puedes usar tu propia clave:

1. Crea una cuenta gratuita en <https://www.themoviedb.org/>.
2. Ve a *Ajustes → API* y copia tu **API key (v3)** o tu **token de lectura (v4)**; la app acepta cualquiera de los dos.
3. En Cinechiquis, entra a **Oficina → Configurar TMDB**, pega la clave y pulsa **Probar conexión**.

La clave se guarda solamente en el `localStorage` del navegador donde se pegó; nunca queda escrita en el código ni se sube al repositorio. Los pósters se cargan directo desde el CDN de imágenes de TMDB (`image.tmdb.org`), sin guardar archivos locales.

> Nota: al ser un sitio estático, cualquier clave usada en el navegador es visible para quien use ese navegador. Por eso conviene usar una API key gratuita de TMDB (sin costo asociado) y no un secreto sensible.

## 🧠 Estado del juego

Todo el estado (boletos vendidos, asientos ocupados, pedidos, carrito, moneditas ganadas y rol elegido) se guarda en `localStorage`, así que el juego se conserva al recargar la página en el mismo navegador. El botón **🧹 Reiniciar todo el cine** (en la Oficina) borra el juego sin borrar la clave de TMDB.

## 📚 Recursos externos usados

- [TMDB API](https://developer.themoviedb.org/) — cartelera y pósters (opcional)
- [QRious](https://github.com/neocotic/qrious) vía CDN de jsDelivr — QR decorativo en los boletos
- [Google Fonts](https://fonts.google.com/) — tipografías *Fredoka* y *Nunito*

Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
