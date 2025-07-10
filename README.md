# ¿Quieres aprender a usar las **elicitations** de MCP? 🚀

¡Hola developer! 👋🏻 En este repositorio tienes un ejemplo para que puedas comprender cómo funcionan las **elicitations** en Model Context Protocol (MCP) a través de un ejemplo práctico: un buscador de videos interactivo (pero fake 🤓)

## 🤔 ¿Qué son las elicitations?

Las **elicitations** son una funcionalidad de MCP que permite a los servidores solicitar información adicional al usuario **durante la ejecución** de una herramienta de forma estandarizada.

### 🎯 ¿Por qué son importantes?

Antes de las elicitations, cuando necesitabas información del usuario durante un workflow, tenías que:
- Añadir los parámetros necesarios en la herramienta, por lo que no podías preguntar dinámicamente
- 🔧 Crear herramientas personalizadas complejas

**Con elicitations**, el servidor puede preguntar dinámicamente:
- Y el usuario puede aceptar, declinar o cancelar la solicitud.
- Podemos darle varias opciones al usuario para que elija, como preferencias de idioma, cantidad de resultados, etc.
- Es combinable con los parametros de la herramienta, por lo que puedes seguir usando herramientas existentes.


### 🔒 Seguridad y buenas prácticas

Según la especificación oficial de MCP:
- 🚫 **Los servidores NO DEBEN** solicitar información sensible
- ✅ **Los clientes DEBEN** mostrar claramente qué servidor solicita información
- 👤 **Los usuarios PUEDEN** revisar y modificar respuestas antes de enviar
- 🛡️ **Siempre** se proporcionan opciones para declinar o cancelar

## 🎬 ¿Qué hace este proyecto?

Este proyecto implementa un **servidor MCP** que busca videos con preferencias personalizables, aunque si quieres verlo con un mcp server que busca vídeos en Youtube de verdad, lo he integrado en este otro repo. Pero en este quería que vieras claro cómo funciona. Cuando solicitas una búsqueda de videos, el servidor:

### 1. 🤖 Solicita tus preferencias usando elicitations

```json
{
  "method": "elicitation/create",
  "params": {
    "message": "Por favor, configura tus preferencias para la búsqueda de videos:",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "language": {
          "type": "string",
          "title": "Idioma preferido",
          "enum": ["spanish", "english", "chinese", "french", "german"],
          "enumNames": ["Español", "Inglés", "Chino", "Francés", "Alemán"]
        },
        "number_of_videos": {
          "type": "number",
          "title": "Cantidad de videos",
          "minimum": 1,
          "maximum": 10,
          "default": 5
        },
        "translated_or_original": {
          "type": "string",
          "title": "Tipo de contenido",
          "enum": ["translated", "original"],
          "enumNames": ["Traducido", "Original"]
        }
      }
    }
  }
}
```

### 2. 🎯 Maneja las tres respuestas posibles

Según la especificación MCP, existen tres acciones de respuesta:

#### ✅ **Accept** - Usuario acepta y proporciona datos
```json
{
  "action": "accept",
  "content": {
    "language": "spanish",
    "number_of_videos": 3,
    "translated_or_original": "original"
  }
}
```

#### ❌ **Decline** - Usuario declina explícitamente
```json
{
  "action": "decline"
}
```

#### 🚫 **Cancel** - Usuario cancela/cierra sin decidir
```json
{
  "action": "cancel"
}
```

### 3. 📊 Genera resultados personalizados

Basándose en la respuesta del usuario, genera videos personalizados o usa valores por defecto si es necesario.

## 🛠️ Tecnologías utilizadas

- 📦 **Node.js** con TypeScript
- 🔗 **Model Context Protocol SDK** (`@modelcontextprotocol/sdk`)
- 🎨 **Chalk** para logs coloridos y informativos
- ✅ **Zod** para validación de esquemas

## 🚀 Cómo usar este proyecto

### 1. 📥 Instalación

```bash
# Clona el repositorio
git clone https://github.com/0GiS0/mcp-elicitations.git
cd mcp-elicitations

# Instala las dependencias
npm install
```

### 2. 🔨 Compilación

```bash
# Compila el TypeScript
npm run build
```

### 3. ⚙️ Configuración MCP

Asegúrate de que tu cliente MCP tenga el servidor configurado en `.vscode/mcp.json`:

```json
{
  "servers": {
    "elicitation-demo": {
      "command": "node",
      "args": ["./dist/src/index.js"],
      "dev": {
        "watch": "src/**/*.ts",
        "debug": {
          "type": "node"
        }
      }
    }
  }
}
```

### 4. 🎮 Uso

Una vez configurado, puedes utilizar Visual Studio Code Insiders (por ahora 😁) para comprobar el flujo.

```
buscar videos sobre gatos
```

El servidor te preguntará tus preferencias y generará resultados personalizados.

## 🧩 Estructura del código

```
src/
├── index.ts          # Servidor MCP principal
├── ├── registerTool()     # Registro de herramienta search-videos
├── ├── elicitation logic  # Implementación completa de elicitations
├── └── error handling     # Manejo de errores y valores por defecto
```

## 📚 Recursos adicionales

- 📖 [Especificación oficial de MCP Elicitations](https://modelcontextprotocol.io/specification/draft/client/elicitation)
- 🔧 [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)


💡 **¿Te gustó este ejemplo?** ¡Dale una estrella ⭐ al repositorio y compártelo con otros developers interesados en MCP!

---

🎥 **¿Te interesa aprender más sobre desarrollo y MCP?**  

¡Sígueme en [YouTube](https://www.youtube.com/@returngis) para más tutoriales y ejemplos.
¡Tu apoyo ayuda a crear más recursos como este! 🚀

¡Nos vemos 👋🏻!
