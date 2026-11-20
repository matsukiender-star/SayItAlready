# Desarrollo

## Requisitos

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Node.js | 22 o superior | Pruebas, scripts y Capacitor |
| JDK | 21 | Compilar el APK |
| Android SDK | API 36 | Compilar el APK (o déjaselo a GitHub Actions) |
| Android Studio | Opcional | Depurar en un teléfono o emulador |

## Preparar el proyecto

```bash
git clone https://github.com/matsukiender-star/SayItAlready.git
cd SayItAlready
npm install
npm test
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm test` | Pruebas (`tests/`), validación de mazos y límite de 800 líneas por archivo |
| `npm run build:web` | Copia la web a `www/` y genera `www/precache.json` |
| `npx serve www` | Sirve la web en `http://localhost:3000` |
| `npm run android:sync` | `build:web` y luego copia `www/` al proyecto Android |
| `npm run android:open` | Abre el proyecto en Android Studio |
| `npm run build:packs` | Genera `packs/*.json` desde `scripts/decks-src/` |
| `npm run validate` | Valida los mazos |
| `npm run check:size` | Comprueba el límite de 800 líneas |
| `npm run icons` | Regenera los íconos PNG desde los SVG de `icons/` |
| `npm run fonts` | Copia las tipografías desde `node_modules` a `fonts/` |

## Probar en el navegador

```bash
npm run build:web
npx serve www
```

Abre `http://localhost:3000`. Para probar el giroscopio en un teléfono necesitas `https`: abre la página con una herramienta como `ngrok`, o activa en Ajustes el control por **Botones**. Con el teclado: **Espacio** acierto, **Enter** pasar, **Esc** pausa.

## Probar en Android

```bash
npm run android:sync
cd android
./gradlew installDebug   # con el teléfono conectado y la depuración USB activada
```

Para ver la consola del WebView, abre `chrome://inspect` en Chrome de la computadora.

## Agregar o cambiar mazos

1. Edita `scripts/decks-src/decks-a.mjs` (clásicos), `decks-b.mjs` (entretenimiento) o `decks-c.mjs` (cultura pop y mímica).
2. Cada mazo tiene `e` (fáciles), `n` (normales) y `h` (difíciles), con las palabras separadas por `|`:

   ```js
   {
     id: 'postres', name: 'Postres', icon: '🍰', category: 'clasicos',
     description: 'Lo más dulce del menú.',
     background: 'linear-gradient(135deg, #ff7eb3, #ff758c)',
     e: 'Pastel|Helado|Galleta',
     n: 'Flan|Churros|Gelatina',
     h: 'Tiramisú|Merengue|Crème brûlée',
   },
   ```

3. Ejecuta `npm run build:packs && npm run validate`.
4. Actualiza la página de la wiki: `node scripts/wiki/build-decks-page.mjs`.

## Pruebas

| Archivo | Qué prueba |
| --- | --- |
| `tests/tilt-detector.test.mjs` | Ángulos, calibración, sensibilidad, histéresis y tiempo muerto del giroscopio |
| `tests/word-queue.test.mjs` | Filtrado por dificultad, dificultad adaptativa y fin de ronda |

Se corren con `node --test tests/*.test.mjs`. La lógica nueva sin interfaz va en `js/models/` y lleva pruebas.

## Reglas del código

Ver [Contribuir](Contribuir) y [Arquitectura](Arquitectura).
