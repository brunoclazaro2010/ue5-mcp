# UE5 MCP — AI-Powered Blueprint Editing for Unreal Engine

Vibe code your Blueprints. This plugin lets Claude Code (or any MCP client) read, modify, and create Unreal Engine 5 Blueprints — just describe what you want in plain English.

> "Add a health component to my player character" · "Find everywhere I use GetActorLocation and replace it" · "What does my damage system do?"

## Getting Started

```bash
cd YourProject/Plugins
git clone https://github.com/mirno-ehf/ue5-mcp.git BlueprintMCP
```

Then tell Claude Code: **"Set up BlueprintMCP"** — it reads the plugin's `CLAUDE.md` and handles the rest.

Requires Node.js 18+ and UE5 5.4+.

## How It Works

A UE5 editor plugin exposes your project's Blueprints over a local HTTP server. An [MCP](https://modelcontextprotocol.io) wrapper connects that to AI tools like Claude Code. When the editor is open, it runs inside the editor process with zero overhead. When the editor is closed, it can spawn a headless process instead.

## License

[MIT](LICENSE)
