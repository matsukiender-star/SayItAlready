# Publicar versiones

## Workflows

| Workflow | Cuándo corre | Qué hace |
| --- | --- | --- |
| **CI** (`ci.yml`) | En cada push y pull request | Pruebas, validación de mazos, límite de líneas y APK de depuración (como artefacto) |
| **Android · Release** (`android-release.yml`) | Con un tag `v*`, o a mano desde *Actions* | Compila el APK firmado y lo publica en *Releases* |
| **Wiki** (`wiki.yml`) | Al cambiar `docs/wiki/` en `main`, o a mano | Publica estas páginas en la wiki de GitHub |
| **Web · GitHub Pages** (`pages.yml`) | A mano | Publica la versión web |

## Sacar una versión nueva

1. Sube la versión en estos cuatro lugares:
   - `package.json` → `"version"`
   - `js/version.js` → `APP_VERSION`
   - `sw.js` → `CACHE_NAME`
   - `android/app/build.gradle` → `versionName` y `versionCode` (este último siempre debe subir, por ejemplo `200` → `201`)
2. Haz commit y súbelo a `main`.
3. Publica de una de estas formas:
   - **Desde Actions:** *Actions → Android · Release → Run workflow* sobre `main`. El tag se toma de `package.json` (por ejemplo `v2.0.1`).
   - **Con un tag:** `git tag v2.0.1 && git push origin v2.0.1`.
   - **Desde Releases:** *Draft a new release*, tag nuevo `v2.0.1` sobre `main` y *Publish release*.
4. En 3 a 5 minutos aparece `DiloYa-v2.0.1.apk` (y su `.sha256`) en *Releases*.

## Firma del APK

Android solo instala una actualización encima de la anterior si las dos están firmadas con la misma llave.

- **Sin secrets configurados:** se usa `android/keystore/dilo-ya-dev.jks`, incluido en el repo. Su contraseña es pública. Sirve para instalar el APK directamente en Android, no para Google Play.
- **Con tu propia llave:** crea un keystore y guárdalo en *Settings → Secrets and variables → Actions*:

| Secret | Valor |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 mi-llave.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore |
| `ANDROID_KEY_ALIAS` | Alias de la llave |
| `ANDROID_KEY_PASSWORD` | Contraseña de la llave, si es distinta |

```bash
keytool -genkeypair -v -keystore mi-llave.jks -alias diloya \
  -keyalg RSA -keysize 2048 -validity 10000
```

> [!WARNING]
> Guarda bien ese keystore. Si lo pierdes, ninguna versión futura se podrá instalar encima de las anteriores.

## Versión web (GitHub Pages)

1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. *Actions → Web · GitHub Pages → Run workflow*.
3. La web queda en `https://matsukiender-star.github.io/SayItAlready/`. Los enlaces QR creados desde la app de Android apuntan ahí.

## Wiki

La wiki se escribe en `docs/wiki/` y el workflow **Wiki** la publica. La primera vez:

1. *Settings → General → Features:* marca **Wikis**.
2. Abre la pestaña **Wiki** y pulsa **Create the first page** → **Save page** (el contenido da igual, se reemplaza).
3. *Actions → Wiki → Run workflow*.

Desde entonces, cada cambio en `docs/wiki/` que llegue a `main` se publica solo.
