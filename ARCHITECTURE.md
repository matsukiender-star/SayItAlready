# Arquitectura

¡Dilo Ya! es una app web **sin build ni frameworks** (HTML, CSS y JavaScript con módulos ES) que se empaqueta como app de Android con **Capacitor 8**. El navegador o el WebView de Android cargan los archivos fuente tal cual.

## Reglas del código

- **Una responsabilidad por archivo.** Cada componente vive en su carpeta, con la lógica (`.js`), la plantilla HTML (`.template.js`) y los estilos (`.css`) por separado.
- **Máximo 800 líneas por archivo.** `npm test` lo comprueba con `scripts/check-file-size.mjs`, y la CI falla si alguno se pasa. Hoy el más largo tiene menos de 300.
- La lógica pura (`models/`, `services/sensors/tilt-*`) no toca el DOM y tiene pruebas en `tests/`.

## Estructura

```
index.html · game.html        páginas (inicio y partida)
sw.js                         service worker (solo web)
css/
  tokens.css                  colores, tipografía, radios, curvas de animación
  base.css                    página, fondo animado, accesibilidad
  shared/                     reset · dialog · controls (botones, segmentado)
js/
  app.js                      arranque del inicio + router de diálogos
  game-app.js                 arranque de la partida (juego ⇄ resumen)
  router/                     url-state · deep-links · start-game
  components/
    shared/                   DialogElement (base), íconos, control segmentado
    home-screen/              pantalla de inicio (coordina los diálogos)
    deck-card/                tarjeta de mazo
    category-chips/           filtros por categoría
    deck-sheet/               detalle del mazo + «¡Jugar!»
    settings-dialog/          ajustes (+ app-status: actualizar/instalar)
    help-dialog/              «Cómo jugar»
    deck-editor/              editor: formulario, filas de palabras, QR
    game-screen/              partida: HUD, escenario de la palabra, depuración
    game-countdown/           cuenta 3-2-1
    round-summary/            resumen: puntuación y lista de palabras
  models/                     deck, word-queue, deck-filters, deck-validation,
                              categories, verdict, labels
  services/
    storage/                  settings, favoritos, historial, mazos (IndexedDB + packs)
    sensors/                  tilt-math, tilt-permission, tilt-detector
    native/                   platform, orientation, haptics, wake-lock, system-ui, app-events
    audio/sounds.js           tonos sintetizados
    feedback.js               sonido + vibración por evento del juego
    timer.js · share.js · compress.js · install.js · app-update.js · service-worker.js
  input/                      swipe · keyboard
  effects/                    confetti · particles
  utils/                      dom · text · color · count-up
  vendor/qrcode.js            generador de QR (terceros)
packs/                        mazos JSON + index.json (generados)
scripts/                      build-web, validate-packs, check-file-size, decks-src/
android/                      proyecto Android de Capacitor
```

## Comunicación entre componentes

Los componentes no se llaman entre sí directamente: emiten eventos que cruzan el Shadow DOM (`utils/dom.js → emit`).

| Evento | Lo emite | Lo atiende |
| --- | --- | --- |
| `deck-select`, `deck-edit`, `favorite-change` | `deck-card` | `home-screen` |
| `category-change` | `category-chips` | `home-screen` |
| `play` {deck, difficulty} | `deck-sheet` | `app.js` → `router/start-game.js` |
| `decks-changed` | `deck-editor` | `home-screen` (recarga) |
| `help-seen` | `help-dialog` | `home-screen` (oculta la tarjeta de ayuda) |
| `dialog-dismiss` | cualquier diálogo | `app.js` → `history.back()` |
| `*-open` (deck-preview, settings, help, edit-deck) | `home-screen` | `app.js` → `pushView` |
| `round-end`, `go-home`, `game-paused`, `game-resumed` | `game-screen` | `game-app.js` |
| `start-game`, `go-home` | `round-summary` | `game-app.js` |

Los diálogos heredan de `components/shared/dialog-element.js`:

- `open()` y `close()` los usa el router y no emiten nada.
- `dismiss()` es el cierre hecho por el usuario: emite `dialog-dismiss` para que el historial retroceda.

## Giroscopio

- `tilt-math.js` desenvuelve `gamma` con `beta` para obtener un ángulo continuo (~90 = neutral) y calcula el centro calibrado.
- `tilt-detector.js` cuenta un gesto cuando el ángulo se aleja del centro más que el umbral de sensibilidad (baja 38°, media 30°, alta 23°). Para volver a contar hay que regresar a la zona neutral y esperar 600 ms.
- `tilt-permission.js` pide el permiso (solo en iOS web) y comprueba que el sensor envíe lecturas.
- `game-screen` empieza a leer el sensor durante la cuenta 3-2-1 y calibra al terminar.

## Mazos

- La fuente está en `scripts/decks-src/decks-{a,b,c}.mjs`. `npm run build:packs` genera `packs/*.json` y `packs/index.json`.
- `npm run validate` revisa el esquema, los ids, los duplicados y las dificultades.

## Compilación y release

- `npm run build:web` copia la web a `www/` y genera `www/precache.json`, la lista que guarda el service worker.
- `npx cap sync android` pasa `www/` al proyecto Android.
- `.github/workflows/android-release.yml` compila y publica el APK firmado con cada tag `v*`.
- `ci.yml` corre las pruebas, el límite de líneas y compila un APK de depuración.
- `pages.yml` publica la versión web.

## Documentación

- `README.md`: presentación, descarga, instalación y guías.
- `docs/wiki/`: fuente de la wiki. El workflow `wiki.yml` la publica junto con `ARCHITECTURE.md` (como Arquitectura), `CONTRIBUTING.md` (Contribuir) y `PRIVACY.md` (Privacidad). La página Mazos se genera desde `packs/` con `scripts/wiki/build-decks-page.mjs`.
- `.github/ISSUE_TEMPLATE/`: plantillas para errores, ideas y mazos.
