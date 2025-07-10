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

    // Antes de buscar los videos, se puede preguntar al usuario sus preferencias
    // de idioma y cantidad de videos a devolver.
    // Aquí se utiliza una elicitation para consultar al usuario.
    try {
      console.log(chalk.magenta("🤔 ") + chalk.white("Creando elicitation para obtener preferencias del usuario..."));
      
      const response = await extra.sendRequest(
        {
          method: "elicitation/create",
          params: {
            message: "¿Prefieres los videos en inglés o en español?",
            requestedSchema: {
              type: "object",
              properties: {
                language: {
                  type: "string",
                  description: "El idioma de los videos",
                },
                number_of_videos: {
                  type: "number",
                  title: "Cantidad de videos a mostrar",
                  description: "Cantidad de videos a devolver en los resultados de búsqueda",
                  minimum: 1,
                  maximum: 10
                },
                translated_or_original: {
                  type: "string",
                  title: "Traducido u Original",
                  enum: ["translated", "original"],
                  enumNames: ["Traducido", "Original"]
                }
              },
            },
          }
        },
        z.any()
      );

      const inputs = [];

      // El usuario puede decidir no responder a la elicitation,
      if (response.action == 'accept' && response.content) {
        // Si el usuario responde, se usan sus preferencias para personalizar la búsqueda.
        console.log(chalk.green("✅ ") + chalk.white("El usuario aceptó la elicitation:"), chalk.gray(JSON.stringify(response.content, null, 2)));

        inputs.push({
          language: response.content.language,
          number_of_videos: response.content.number_of_videos,
          translated_or_original: response.content.translated_or_original,
        });

      } else {
        // Si el usuario no responde, se usan valores por defecto.
        console.log(chalk.yellow("⚠️  ") + chalk.white("El usuario no aceptó la elicitation, usando valores por defecto."));

        inputs.push({
          language: "English",
          number_of_videos: 5,
          translated_or_original: "original",
        });

      }

      // Obtener los valores de las preferencias del usuario o los valores por defecto
      const { language, number_of_videos, translated_or_original } = inputs[0];

      console.log(chalk.blue("⚙️  ") + chalk.white("Configuración final:"));
      console.log(chalk.gray("   📝 Idioma:"), chalk.cyan(language));
      console.log(chalk.gray("   🔢 Cantidad de videos:"), chalk.cyan(number_of_videos));
      console.log(chalk.gray("   🌐 Tipo:"), chalk.cyan(translated_or_original));

      console.log(chalk.green("🚀 ") + chalk.white("Generando resultados de videos..."));

      // Generar dinámicamente la cantidad de resultados solicitados
      const results = Array.from({ length: number_of_videos }, (_, i) => ({
        title: `${i === 0 ? "" : "Otro "}video sobre ${query} en ${language} (${translated_or_original})`,
        url: `https://example.com/video/${query.replace(/\s+/g, "-")}-${language.toLowerCase()}${translated_or_original === "translated" ? "-translated" : ""}${i > 0 ? `-${i + 1}` : ""}`,
        description: `${i === 0 ? "Un" : "Otro"} video que trata sobre ${query} en ${language} (${translated_or_original}).`,
      }));

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
            text: `${video.title}\n${video.url}\n${video.description}`,
          })),
        ],
      };
   
    } catch (error) {
      // Manejo de errores durante la elicitation
      console.error(chalk.red("❌ ") + chalk.white("Error durante la elicitation:"), chalk.red(error));
      return {
        content: [
          {
            type: "text" as const,
            text: "Ocurrió un error al intentar consultar la preferencia de idioma. Por favor, inténtalo de nuevo.",
          },
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
