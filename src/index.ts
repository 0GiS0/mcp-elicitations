import {
  McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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

    // Antes de buscar los videos, se puede preguntar al usuario sus preferencias
    // de idioma y cantidad de videos a devolver.
    // Aquí se utiliza una elicitation para consultar al usuario.
    try {
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
        console.log("El usuario aceptó la elicitation:", response.content);

        inputs.push({
          language: response.content.language,
          number_of_videos: response.content.number_of_videos,
          translated_or_original: response.content.translated_or_original,
        });

      } else {
        // Si el usuario no responde, se usan valores por defecto.
        console.log("El usuario no aceptó la elicitation, usando valores por defecto.");

        inputs.push({
          language: "English",
          number_of_videos: 5,
          translated_or_original: "original",
        });

      }

      // Obtener los valores de las preferencias del usuario o los valores por defecto
      const { language, number_of_videos, translated_or_original } = inputs[0];

      // Generar dinámicamente la cantidad de resultados solicitados
      const results = Array.from({ length: number_of_videos }, (_, i) => ({
        title: `${i === 0 ? "" : "Otro "}video sobre ${query} en ${language} (${translated_or_original})`,
        url: `https://example.com/video/${query.replace(/\s+/g, "-")}-${language.toLowerCase()}${translated_or_original === "translated" ? "-translated" : ""}${i > 0 ? `-${i + 1}` : ""}`,
        description: `${i === 0 ? "Un" : "Otro"} video que trata sobre ${query} en ${language} (${translated_or_original}).`,
      }));

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
      console.error("Error durante la elicitation:", error);
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
const transport = new StdioServerTransport();
await server.connect(transport);
