# Cómo contribuir

¡Gracias por ayudar a mejorar ¡Dilo Ya!!

## Antes de empezar

- **Errores e ideas:** abre un [issue](https://github.com/matsukiender-star/SayItAlready/issues/new/choose) con la plantilla que corresponda.
- **Mazos nuevos o palabras:** usa la plantilla «Mazo nuevo o palabras». No hace falta saber programar.
- **Cambios grandes:** abre primero un issue para platicarlo y no trabajar de más.

## Preparar el proyecto

```bash
npm install
npm test
npm run build:web && npx serve www
```

Los detalles están en la wiki: [Desarrollo](https://github.com/matsukiender-star/SayItAlready/wiki/Desarrollo).

## Reglas del código

- **Una responsabilidad por archivo.** Cada componente tiene su carpeta con lógica (`.js`), plantilla (`.template.js`) y estilos (`.css`) por separado.
- **Máximo 800 líneas por archivo.** `npm test` falla si alguno se pasa.
- **Sin frameworks ni bundler:** JavaScript con módulos ES, Web Components y CSS.
- **Interfaz en español latino**, con acentos y signos de apertura (¡ ¿).
- **Animaciones solo con `transform` y `opacity`**, respetando `prefers-reduced-motion`.
- **La lógica pura va en `js/models/`** y lleva pruebas en `tests/`.

## Mazos

- No edites `packs/*.json` a mano: se generan desde `scripts/decks-src/decks-*.mjs`.
- Después de cambiarlos, ejecuta `npm run build:packs && npm run validate`.
- Cada palabra va en fácil (`e`), normal (`n`) o difícil (`h`), separadas por `|`.
- Evita palabras ofensivas o que solo se entiendan en una región muy pequeña.

## Pull requests

1. Crea una rama desde `main`.
2. Haz commits pequeños con mensajes claros en español.
3. Corre `npm test` y prueba la app en el navegador, y si puedes en un Android.
4. Describe qué cambiaste y por qué. Si cambia la interfaz, agrega una captura.

## Código de conducta

Trata a todos con respeto. No se aceptan insultos, acoso ni contenido ofensivo en issues, pull requests o mazos.
