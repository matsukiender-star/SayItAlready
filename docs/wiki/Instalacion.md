# Instalación

## Requisitos

| Plataforma | Requisito |
| --- | --- |
| Android | Android 7.0 (Nougat) o superior. El giroscopio es opcional: sin él se juega con botones. |
| Web | Chrome, Edge, Firefox o Safari recientes. Para usar el giroscopio, la página debe abrirse con `https`. |

## Android

1. En tu teléfono, abre la [última versión](https://github.com/matsukiender-star/SayItAlready/releases/latest).
2. En **Assets**, descarga `DiloYa-vX.Y.Z.apk`.
3. Ábrelo desde las notificaciones o desde **Descargas**.
4. Android pide permiso para instalar apps desde tu navegador o tu administrador de archivos. Pulsa **Configuración**, activa **Permitir de esta fuente** y vuelve.
5. Pulsa **Instalar** y luego **Abrir**.

### Si aparece Play Protect

La app no viene de Google Play, así que Play Protect puede decir que es desconocida. Pulsa **Más detalles** y luego **Instalar de todas formas**.

### Comprobar la descarga (opcional)

Cada versión trae un archivo `.sha256`. En una computadora:

```bash
sha256sum -c DiloYa-v2.0.0.apk.sha256
```

Debe decir `OK`.

## Actualizar

Descarga el `.apk` nuevo e instálalo encima del anterior. Tus mazos propios, favoritos y ajustes se conservan.

> [!WARNING]
> Si una versión se firmó con otra llave, Android responde «La app no se instaló» o «conflicto con un paquete existente». En ese caso desinstala la versión anterior. Al hacerlo se borran tus mazos propios, así que antes cópialos desde la pestaña **JSON** del editor.

## Versión web

La versión web es la misma app y se puede instalar como una app más.

1. Abre la página de la versión web (ver [Publicar versiones](Publicar-versiones) para activarla).
2. En Android con Chrome: menú ⋮ → **Instalar app** o **Agregar a la pantalla principal**.
3. En iPhone con Safari: botón **Compartir** → **Agregar a inicio**.

Para actualizarla, abre **⚙️ Ajustes**. Si hay una versión nueva aparece el botón **actualizar**.

## Desinstalar

Mantén presionado el ícono de ¡Dilo Ya! y elige **Desinstalar**. Se borran los ajustes, los favoritos y los mazos propios.
