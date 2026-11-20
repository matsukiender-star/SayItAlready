# Crear y compartir mazos

Puedes hacer mazos con tus propias palabras: chistes del grupo, nombres de la familia, temas de clase…

## Crear un mazo

1. En la pantalla de inicio, baja hasta la tarjeta **＋ Crear mazo** (en la categoría *Todos* o *Mis mazos*).
2. Llena el formulario:
   - **Ícono:** un emoji (🎲, 🐶, 🎤…).
   - **Nombre:** obligatorio.
   - **Descripción:** opcional, aparece en el detalle del mazo.
   - **Colores:** los dos colores del degradado de la tarjeta.
3. Pulsa **＋ Agregar palabra** por cada palabra y elige su dificultad (*Fácil*, *Normal* o *Difícil*). Cada palabra nueva toma la dificultad de la anterior.
4. Pulsa **Guardar**.

Tu mazo aparece en la lista y en la categoría **🛠️ Mis mazos**.

## Editar o borrar

Los mazos propios tienen un botón ✏️ en su tarjeta. Ahí puedes cambiar todo o pulsar **Eliminar**. Los mazos incluidos no se pueden editar.

## Compartir

### Con código QR

1. Abre el editor del mazo y elige la pestaña **Código QR**.
2. Tu amigo escanea el código con la cámara. Se abre la versión web con el editor ya lleno; solo pulsa **Guardar**.
3. También puedes copiar el enlace con 📋 y mandarlo por WhatsApp.

El mazo va comprimido dentro del enlace: no se sube a ningún servidor. Si el mazo tiene muchas palabras, el QR no alcanza; en ese caso usa JSON.

### Con JSON

1. En el editor, elige la pestaña **JSON** y copia el texto.
2. Tu amigo crea un mazo nuevo, abre la pestaña **JSON**, pega el texto y pulsa **Guardar**.

## Formato JSON

```json
{
  "id": "mi-familia",
  "name": "Mi familia",
  "description": "Puros chismes familiares",
  "icon": "👨‍👩‍👧",
  "background": "linear-gradient(135deg, #7c5cff, #ff3d7f)",
  "words": [
    { "text": "La tía Lupe", "tags": ["difficulty:0"] },
    { "text": "El perro del vecino", "tags": ["difficulty:1"] },
    "Una palabra sin dificultad"
  ]
}
```

| Campo | Obligatorio | Notas |
| --- | --- | --- |
| `id` | Sí | Identificador único. Si ya existe uno igual, se reemplaza. |
| `name` | Sí | Nombre visible. |
| `words` | Sí | Al menos una. Texto o `{ "text", "tags" }`. |
| `tags` | No | `difficulty:0` fácil, `difficulty:1` normal, `difficulty:2` difícil. Sin tag cuenta como fácil. |
| `description`, `icon`, `background` | No | `background` es un degradado CSS. |

## Enlaces de importación

| Enlace | Qué hace |
| --- | --- |
| `…/index.html?view=edit&add=<datos>` | Abre el editor con el mazo; el usuario decide si lo guarda. Es el formato del QR. |
| `…/index.html#import/<base64>` | Importa el mazo directamente. `<base64>` es el JSON en Base64. |

## Dónde se guardan

Los mazos propios se guardan en IndexedDB (base de datos `DiloYaDB`) del dispositivo. Si desinstalas la app o borras los datos del navegador, se pierden, así que guarda una copia del JSON.

## Proponer un mazo para todos

¿Tu mazo podría servirle a más gente? Abre un [issue](https://github.com/matsukiender-star/SayItAlready/issues/new/choose) con la plantilla **Mazo nuevo o palabras** y pega el JSON.
