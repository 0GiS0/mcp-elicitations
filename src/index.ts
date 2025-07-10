import {
  McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import chalk from "chalk";


// Crear un servidor MCP
const server = new McpServer({
  name: "elicitation-demo",
  version: "1.0.0",
});

// Registrar una herramienta para buscar videos
server.registerTool(
  "search-videos",
  {
    title: "Buscar Videos",
    description: "Busca videos sobre un tema específico",
    inputSchema: { query: z.string() },
  },
  async ({ query }, extra) => {

    console.log(chalk.blue("🔍 ") + chalk.cyan("Iniciando búsqueda de videos para:") + chalk.yellow(` "${query}"`));

    // Implementación de elicitation siguiendo la especificación MCP:
    // - Solo solicitamos información no sensible (preferencias de búsqueda)
    // - Proporcionamos esquemas claros y descriptivos
    // - Manejamos las tres acciones posibles: accept, decline, cancel
    // - Proporcionamos valores por defecto razonables
    // - Validamos la entrada del usuario
    try {
      console.log(chalk.magenta("🤔 ") + chalk.white("Creando elicitation para obtener preferencias del usuario..."));

      const response = await extra.sendRequest(
        {
          method: "elicitation/create",
          params: {
            message: "Por favor, configura tus preferencias para la búsqueda de videos:",
            requestedSchema: {
              type: "object",
              properties: {
                language: {
                  type: "string",
                  title: "Idioma preferido",
                  description: "El idioma en el que prefieres que estén los videos",
                  enum: ["spanish", "english", "chinese", "french", "german"],
                  enumNames: ["Español", "Inglés", "Chino", "Francés", "Alemán"]
                },
                number_of_videos: {
                  type: "number",
                  title: "Cantidad de videos",
                  description: "Número de videos que deseas obtener en los resultados",
                  minimum: 1,
                  maximum: 10,
                  default: 5
                },
                translated_or_original: {
                  type: "string",
                  title: "Tipo de contenido",
                  description: "¿Prefieres contenido original o traducido?",
                  enum: ["translated", "original"],
                  enumNames: ["Traducido", "Original"],
                  default: "original"
                }
              },
              required: ["language"]
            },
          }
        },
        z.any()
      );

      // Procesar la respuesta del usuario según la especificación MCP
      let userPreferences = {
        language: "english",
        number_of_videos: 5,
        translated_or_original: "original",
      };

      if (response.action === 'accept' && response.content) {
        // Si el usuario acepta y proporciona datos, usar sus preferencias
        console.log(chalk.green("✅ ") + chalk.white("El usuario aceptó la elicitation:"), chalk.gray(JSON.stringify(response.content, null, 2)));

        userPreferences = {
          language: response.content.language || userPreferences.language,
          number_of_videos: response.content.number_of_videos || userPreferences.number_of_videos,
          translated_or_original: response.content.translated_or_original || userPreferences.translated_or_original,
        };

      } else if (response.action === 'decline') {
        // Si el usuario declina explícitamente, usar valores por defecto pero informar
        console.log(chalk.yellow("❌ ") + chalk.white("El usuario declinó configurar preferencias, usando valores por defecto."));

      } else if (response.action === 'cancel') {
        // Si el usuario cancela, usar valores por defecto y tal vez ofrecer alternativas
        console.log(chalk.yellow("⚠️ ") + chalk.white("El usuario canceló la configuración, usando valores por defecto."));

      } else {
        // Caso de respuesta inesperada
        console.log(chalk.red("⚠️ ") + chalk.white("Respuesta inesperada de elicitation, usando valores por defecto."));
      }

      // Obtener los valores finales de preferencias
      const { language, number_of_videos, translated_or_original } = userPreferences;

      console.log(chalk.blue("⚙️  ") + chalk.white("Configuración final:"));
      console.log(chalk.gray("   📝 Idioma:"), chalk.cyan(language));
      console.log(chalk.gray("   🔢 Cantidad de videos:"), chalk.cyan(number_of_videos));
      console.log(chalk.gray("   🌐 Tipo:"), chalk.cyan(translated_or_original));

      console.log(chalk.green("🚀 ") + chalk.white("Generando resultados de videos..."));

      // Generar dinámicamente la cantidad de resultados solicitados
      const results = Array.from({ length: number_of_videos }, (_, i) => {
        const typeDisplayName = translated_or_original === "translated" ? "traducido" : "original";

        return {
          title: `${i === 0 ? "" : "Otro "}video sobre ${query} en ${language} (${typeDisplayName})`,
          url: `https://example.com/video/${query.replace(/\s+/g, "-")}-${language.toLowerCase()}${translated_or_original === "translated" ? "-translated" : ""}${i > 0 ? `-${i + 1}` : ""}`,
          description: `${i === 0 ? "Un" : "Otro"} video que trata sobre ${query} en ${language} (${typeDisplayName}).`,
        };
      });

      console.log(chalk.green("🎯 ") + chalk.white("¡Búsqueda completada exitosamente!"));
      console.log(chalk.blue("📊 ") + chalk.white(`Se generaron ${results.length} resultados`));

      return {
        content: [
          {
            type: "text" as const,
            text: `Se encontraron ${results.length} videos sobre "${query}" en ${language}:`,
          },
          ...results.map((video) => ({
            type: "text" as const,
            text: `📹 **${video.title}**\n🔗 ${video.url}\n📝 ${video.description}\n`,
          })),
        ],
      };

    } catch (error) {
      // Manejo de errores durante la elicitation según la especificación MCP
      console.error(chalk.red("❌ ") + chalk.white("Error durante la elicitation:"), chalk.red(error));

      // Usar valores por defecto en caso de error y continuar con la operación
      const defaultPreferences = {
        language: "english",
        number_of_videos: 5,
        translated_or_original: "original",
      };

      console.log(chalk.yellow("🔄 ") + chalk.white("Continuando con valores por defecto debido al error."));

      const results = Array.from({ length: defaultPreferences.number_of_videos }, (_, i) => {
        const typeDisplayName = defaultPreferences.translated_or_original === "translated" ? "traducido" : "original";

        return {
          title: `${i === 0 ? "" : "Otro "}video sobre ${query} en ${defaultPreferences.language} (${typeDisplayName})`,
          url: `https://example.com/video/${query.replace(/\s+/g, "-")}-${defaultPreferences.language.toLowerCase()}${defaultPreferences.translated_or_original === "translated" ? "-translated" : ""}${i > 0 ? `-${i + 1}` : ""}`,
          description: `${i === 0 ? "Un" : "Otro"} video que trata sobre ${query} en ${defaultPreferences.language} (${typeDisplayName}).`,
        };
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `⚠️ No se pudieron obtener preferencias del usuario. Se encontraron ${results.length} videos sobre "${query}" con configuración por defecto:`,
          },
          ...results.map((video) => ({
            type: "text" as const,
            text: `📹 **${video.title}**\n🔗 ${video.url}\n📝 ${video.description}\n`,
          })),
        ],
      };
    }
  }
);

// Iniciar la recepción de mensajes por stdin y el envío por stdout
console.log(chalk.green("🚀 ") + chalk.white("Iniciando servidor MCP..."));
const transport = new StdioServerTransport();
await server.connect(transport);
console.log(chalk.green("✅ ") + chalk.white("Servidor MCP conectado y listo para recibir solicitudes!"));
