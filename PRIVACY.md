# Privacidad

**¡Dilo Ya!** funciona completamente en tu dispositivo.

## Datos que guarda

Todo se queda en tu teléfono o navegador:

- **localStorage**: ajustes (controles, tiempo, sonido, sensibilidad), historial de mazos jugados, favoritos y si ya viste «Cómo jugar».
- **IndexedDB**: los mazos que creas o importas.

No se envía nada a ningún servidor.

## Conexiones

La app no tiene analíticas, rastreo ni telemetría.

- **App de Android:** todos los archivos van dentro del APK, así que no necesita internet. El permiso de internet existe solo porque lo exige el motor web de Capacitor.
- **Versión web:** descarga los archivos de la app y los mazos, los guarda en caché para usarse sin conexión y, en Ajustes, consulta `version.js` para saber si hay una actualización.

## Sensores

El giroscopio se lee solo durante la partida, para detectar la inclinación. Los datos no se guardan ni se envían.

## Terceros

No hay scripts de terceros, SDK, cookies ni publicidad.

## Compartir con código QR

Al generar un QR, el mazo se comprime dentro del propio enlace. No se sube nada: el teléfono que lo abre lo decodifica localmente.
