# Want to learn how to use MCP **elicitations**? 🚀

> **🌐 Languages:** [🇪🇸 Español](README.md) | [🇺🇸 English](README.en.md)

Hello developer! 👋🏻 In this repository you have an example to understand how **elicitations** work in Model Context Protocol (MCP) through a practical example: an interactive video search engine (but fake 🤓)

## 🤔 What are elicitations?

**Elicitations** are an MCP functionality that allows servers to request additional information from the user **during execution** of a tool in a standardized way.

### 🎯 Why are they important?

Before elicitations, when you needed information from the user during a workflow, you had to:
- Add necessary parameters to the tool, so you couldn't ask dynamically
- 🔧 Create complex custom tools

**With elicitations**, the server can ask dynamically:
- And the user can accept, decline, or cancel the request.
- We can give the user several options to choose from, like language preferences, number of results, etc.
- It's combinable with tool parameters, so you can continue using existing tools.


### 🔒 Security and best practices

According to the official MCP specification:
- 🚫 **Servers MUST NOT** request sensitive information
- ✅ **Clients MUST** clearly show which server is requesting information
- 👤 **Users CAN** review and modify responses before sending
- 🛡️ **Always** provide options to decline or cancel

## 🎬 What does this project do?

This project implements an **MCP server** that searches for videos with customizable preferences, although if you want to see it with an mcp server that actually searches for videos on YouTube, I've integrated it in this other repo. But in this one I wanted you to see clearly how it works. When you request a video search, the server:

### 1. 🤖 Requests your preferences using elicitations

```json
{
  "method": "elicitation/create",
  "params": {
    "message": "Please configure your preferences for video search:",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "language": {
          "type": "string",
          "title": "Preferred language",
          "enum": ["spanish", "english", "chinese", "french", "german"],
          "enumNames": ["Spanish", "English", "Chinese", "French", "German"]
        },
        "number_of_videos": {
          "type": "number",
          "title": "Number of videos",
          "minimum": 1,
          "maximum": 10,
          "default": 5
        },
        "translated_or_original": {
          "type": "string",
          "title": "Content type",
          "enum": ["translated", "original"],
          "enumNames": ["Translated", "Original"]
        }
      }
    }
  }
}
```

### 2. 🎯 Handles the three possible responses

According to the MCP specification, there are three response actions:

#### ✅ **Accept** - User accepts and provides data
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

#### ❌ **Decline** - User explicitly declines
```json
{
  "action": "decline"
}
```

#### 🚫 **Cancel** - User cancels/closes without deciding
```json
{
  "action": "cancel"
}
```

### 3. 📊 Generates personalized results

Based on the user's response, it generates personalized videos or uses default values if necessary.

## 🛠️ Technologies used

- 📦 **Node.js** with TypeScript
- 🔗 **Model Context Protocol SDK** (`@modelcontextprotocol/sdk`)
- 🎨 **Chalk** for colorful and informative logs
- ✅ **Zod** for schema validation

## 🚀 How to use this project

### 1. 📥 Installation

```bash
# Clone the repository
git clone https://github.com/0GiS0/mcp-elicitations.git
cd mcp-elicitations

# Install dependencies
npm install
```

### 2. 🔨 Build

```bash
# Compile TypeScript
npm run build
```

### 3. ⚙️ MCP Configuration

Make sure your MCP client has the server configured in `.vscode/mcp.json`:

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

### 4. 🎮 Usage

Once configured, you can use Visual Studio Code Insiders (for now 😁) to test the flow.

```
search videos about cats
```

The server will ask for your preferences and generate personalized results.

## 🧩 Code structure

```
src/
├── index.ts          # Main MCP server
├── ├── registerTool()     # search-videos tool registration
├── ├── elicitation logic  # Complete elicitations implementation
├── └── error handling     # Error handling and default values
```

## 📚 Additional resources

- 📖 [Official MCP Elicitations Specification](https://modelcontextprotocol.io/specification/draft/client/elicitation)
- 🔧 [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)


💡 **Did you like this example?** Give the repository a star ⭐ and share it with other developers interested in MCP!

---

🎥 **Interested in learning more about development and MCP?**  

Follow me on [YouTube](https://www.youtube.com/@returngis) for more tutorials and examples.
Your support helps create more resources like this! 🚀

See you around 👋🏻!