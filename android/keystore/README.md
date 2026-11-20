# Keystore de desarrollo

`dilo-ya-dev.jks` firma los APK que publica GitHub Actions cuando el repositorio
no tiene secrets de firma configurados. Su contraseña es pública
(`diloya-dev`), así que **no lo uses para Google Play**.

Para publicar con tu propia firma, crea un keystore y agrega estos secrets en
*Settings → Secrets and variables → Actions*:

| Secret | Valor |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 mi-keystore.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | contraseña del keystore |
| `ANDROID_KEY_ALIAS` | alias de la llave |
| `ANDROID_KEY_PASSWORD` | contraseña de la llave (si es distinta) |

Ojo: un APK firmado con otra llave no se instala encima del anterior;
hay que desinstalar la versión vieja primero.
