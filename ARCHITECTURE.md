# Arquitectura

¡Dilo Ya! es una app web **sin build ni frameworks** (HTML, CSS y JavaScript con módulos ES) que se empaqueta como app de Android con **Capacitor 8**. El navegador o el WebView de Android cargan los archivos fuente tal cual.

## Capas

| Capa | Tecnología | Notas |
| --- | --- | --- |
| UI | Web Components + Shadow DOM | `home-screen`, `game-screen`, `round-summary` |
| Estilos | CSS con anidamiento nativo | Tokens de diseño en `css/styles.css`; animaciones solo con `transform`/`opacity` |
| Tipografía | Fredoka + Inter (woff2 locales) | `fonts/`, copiadas con `npm run fonts` |
| Datos | `packs/*.json` + `packs/index.json` | Mazos integrados; los propios van en IndexedDB |
| Ajustes | localStorage | `js/services/settings.js` |
| Android | Capacitor 8 | `android/`; plugins leídos de `window.Capacitor.Plugins` |
| Web | PWA + service worker | Solo se registra fuera de la app nativa |

## Flujo

1. `index.html` → `js/app.js` monta `<home-screen>`. Los diálogos (mazo, ajustes, ayuda, editor) se reflejan en la URL (`?view=…`), así que el botón «atrás» los cierra.
2. «¡Jugar!» navega a `game.html?deck=…&difficulty=…&tilt=…`. `js/game-app.js` comprueba el sensor; si no hay giroscopio, usa botones.
3. `<game-screen>`: cuenta 3‑2‑1 (mientras tanto el giroscopio calibra la postura neutral), ronda con reloj y tarjeta animada por palabra.
4. Al terminar, `<round-summary>` muestra la puntuación, el confeti y la lista de palabras.

## Giroscopio (`js/services/tilt-detector.js`)

- En horizontal se usa `gamma`, que salta en ±90° justo en la posición de la frente. Se «desenvuelve» con `beta` para obtener un ángulo continuo donde ~90 es neutral (`landscapeTilt`).
- `calibrate()` promedia las últimas lecturas al terminar la cuenta y fija el centro (entre 65° y 115°).
- Un gesto cuenta si el ángulo se aleja del centro más que el umbral de sensibilidad (baja 38°, media 30°, alta 23°).
- Para volver a contar hay que regresar a la zona neutral (55 % del umbral) y esperar 600 ms. Así se evitan los dobles conteos.
- Pruebas: `tests/tilt-detector.test.mjs` (`npm test`).

## Capa nativa (`js/services/native.js`)

| Función | Android (plugin) | Web |
| --- | --- | --- |
| `lockLandscape` / `unlockOrientation` | `@capacitor/screen-orientation` | `screen.orientation.lock` |
| `vibrate` | `@capacitor/haptics` | `navigator.vibrate` |
| `keepAwake` / `allowSleep` | `@capacitor-community/keep-awake` | Wake Lock API |
| `setImmersive` | `@capacitor/status-bar` | — |
| `bindBackButton` | `@capacitor/app` | — |

`MainActivity.java` pone la app en pantalla completa inmersiva.

## Mazos

- Fuente: `scripts/decks-src/decks-{a,b,c}.mjs`. Cada mazo lista palabras fáciles, normales y difíciles separadas por `|`.
- `npm run build:packs` genera `packs/*.json` y `packs/index.json`.
- `npm run validate` revisa el esquema, los ids, los duplicados y las dificultades.
- Categorías: `clasicos`, `entretenimiento`, `cultura-pop`, `mimica`.

## Compilación y release

- `npm run build:web` copia la web a `www/` y `npx cap sync android` la pasa al proyecto Android.
- `.github/workflows/android-release.yml`: con un tag `v*` compila `assembleRelease` y publica el APK en Releases.
- `.github/workflows/ci.yml`: pruebas y APK de depuración en cada push.
- `.github/workflows/pages.yml`: publica la versión web en GitHub Pages (manual).
