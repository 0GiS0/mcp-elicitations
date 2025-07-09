import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js";
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
    // Antes de buscar el vídeo, se puede preguntar al usuario si quiere que sean en inglés o en español
    // y filtrar los resultados en base a eso.

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
              },
            },
          },
        },
        z.any()
      );

      const language = response.content.language;

      // Simulate a search operation
      const results = [
        {
          title: `Video about ${query} in ${language}`,
          url: `https://example.com/video/${query.replace(
            /\s+/g,
            "-"
          )}-${language.toLowerCase()}`,
          description: `A video discussing ${query} in ${language}.`,
        },
        {
          title: `Another video about ${query} in ${language}`,
          url: `https://example.com/video/${query.replace(
            /\s+/g,
            "-"
          )}-${language.toLowerCase()}-2`,
          description: `Another video discussing ${query} in ${language}.`,
        },
      ];

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
