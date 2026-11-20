# Política de seguridad

## Versiones con soporte

Solo la versión más reciente publicada en [Releases](https://github.com/matsukiender-star/SayItAlready/releases/latest) recibe correcciones.

## Reportar un problema

Si encuentras un problema de seguridad, **no abras un issue público**. Repórtalo en privado desde la pestaña **Security** del repositorio, con **Report a vulnerability**.

Incluye:

- qué versión usas (Android o web) y en qué dispositivo;
- los pasos para reproducir el problema;
- qué podría hacer alguien que lo aprovechara.

Te responderemos lo antes posible.

## Alcance

¡Dilo Ya! no tiene servidores ni cuentas: todo se guarda en el dispositivo. Los puntos más sensibles son:

- la importación de mazos desde JSON o enlaces (`?view=edit&add=…` y `#import/…`);
- la firma del APK.

El keystore de desarrollo incluido en `android/keystore/` es público a propósito y **no** sirve para publicar en Google Play. Lee [android/keystore/README.md](android/keystore/README.md).
