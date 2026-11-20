# Controles y giroscopio

El modo de control se elige en **⚙️ Ajustes → Controles**.

| Modo | Acierto ✅ | Pasar ⏭ |
| --- | --- | --- |
| 📱 Giroscopio | Inclinar la cabeza hacia abajo | Inclinar la cabeza hacia arriba |
| 👆 Deslizar | Deslizar hacia la derecha | Deslizar hacia la izquierda |
| 🔘 Botones | Tocar la mitad derecha | Tocar la mitad izquierda |
| ⌨️ Teclado (siempre activo) | Espacio, → o ↓ | Enter, ← o ↑ |

**Esc** o **P** pausan la ronda en cualquier modo.

## Giroscopio

### Cómo funciona

1. Durante la cuenta 3-2-1 la app lee el sensor y **calibra**: toma tu postura como posición neutral. Así funciona aunque tengas la cabeza un poco inclinada.
2. Un gesto cuenta cuando te alejas de esa posición más que el **umbral de sensibilidad**.
3. Para contar el siguiente gesto hay que **volver al centro** y esperar un momento (0.6 segundos). Así no se cuentan dos veces.
4. Si al empezar ya estás inclinado, no cuenta nada hasta que vuelvas al centro.

### Sensibilidad

| Sensibilidad | Inclinación necesaria | Úsala si… |
| --- | --- | --- |
| Alta | 23° | cuesta que cuente los gestos |
| Media (por defecto) | 30° | — |
| Baja | 38° | cuenta gestos que no hiciste |

### Si el teléfono no tiene giroscopio

Al empezar la partida, la app comprueba que el sensor envíe datos. Si no responde en 1.5 segundos, la ronda usa **botones**. En Ajustes, el giroscopio aparece como **No disponible**.

### Modo depuración

En **⚙️ Ajustes → Preferencias → Modo depuración del giroscopio** aparece un panel en la esquina con los datos del sensor:

- `ángulo`: inclinación actual (~90 = neutral);
- `centro`: posición neutral calibrada;
- `Δ`: diferencia con el centro, la que se compara con el umbral;
- `estado`: `neutral` (listo para contar) o `fired` (esperando volver al centro).

Úsalo para ajustar la sensibilidad o para reportar un problema del giroscopio en un [issue](https://github.com/matsukiender-star/SayItAlready/issues/new/choose).

## Detalles técnicos

Con el teléfono en horizontal sobre la frente, el ángulo `gamma` del sensor salta de +90° a −90° justo en la posición neutral. La app lo «desenvuelve» con el ángulo `beta` para obtener un valor continuo. El código está en `js/services/sensors/` y sus pruebas en `tests/tilt-detector.test.mjs`. Más en [Arquitectura](Arquitectura).
