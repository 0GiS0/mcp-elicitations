import {
  McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "elicitation-demo",
  version: "1.0.0",
});

// Add a search videos tool
server.registerTool(
  "search-videos",
  {
    title: "Search Videos",
    description: "Search for videos on a specific topic",
    inputSchema: { query: z.string() },
  },
  async ({ query }, extra) => {

    // Antes de buscar los vídeos se le puede preguntar al usuario sus preferencias
    // de idioma y número de vídeos a devolver.
    // Aquí se utiliza una elicitation para preguntar al usuario.
    try {
      const response = await extra.sendRequest(
        {
          method: "elicitation/create",
          params: {
            message: "Would you like the videos in English or Spanish?",
            requestedSchema: {
              type: "object",
              properties: {
                language: {
                  type: "string",
                  description: "The language of the videos",
                },
                number_of_videos: {
                  type: "number",
                  title: "Number of videos to return",
                  description: "The number of videos to return in the search results",
                  minimum: 1,
                  maximum: 10
                },
                translated_or_original: {
                  type: "string",
                  title: "Translated or Original",
                  enum: ["translated", "original"],
                  enumNames: ["Translated", "Original"]
                }
              },
            },
          }
        },
        z.any()
      );


      const inputs = [];

      // Sin embargo, el usuario puede no querer responder a la elicitation,
      if (response.action == 'accept' && response.content) {
        // Si el usuario acepta la elicitation, se puede utilizar la respuesta
        // para personalizar la búsqueda de vídeos.
        console.log("User accepted elicitation:", response.content);

        inputs.push({
          language: response.content.language,
          number_of_videos: response.content.number_of_videos,
          translated_or_original: response.content.translated_or_original,
        });


      } else {
        // Si el usuario no acepta la elicitation, se puede utilizar un valor por defecto
        console.log("User did not accept elicitation, using default values.");

        inputs.push({
          language: "English",
          number_of_videos: 5,
          translated_or_original: "original",
        });

      }

      

      
      // Obtener los valores de los inputs (preferencias del usuario o por defecto)
      const { language, number_of_videos, translated_or_original } = inputs[0];

      // Generar dinámicamente la cantidad de resultados solicitados
      const results = Array.from({ length: number_of_videos }, (_, i) => ({
        title: `${i === 0 ? "" : "Another "}video about ${query} in ${language} (${translated_or_original})`,
        url: `https://example.com/video/${query.replace(/\s+/g, "-")}-${language.toLowerCase()}${translated_or_original === "translated" ? "-translated" : ""}${i > 0 ? `-${i + 1}` : ""}`,
        description: `${i === 0 ? "A" : "Another"} video discussing ${query} in ${language} (${translated_or_original}).`,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: `Found ${results.length} videos about "${query}" in ${language}:`,
          },
          ...results.map((video) => ({
            type: "text" as const,
            text: `${video.title}\n${video.url}\n${video.description}`,
          })),
        ],
      };
   
    } catch (error) {
      console.error("Error during elicitation:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: "An error occurred while trying to elicit the language preference. Please try again.",
          },
        ],
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
