# BlueprintMCP

An [MCP](https://modelcontextprotocol.io) server that lets AI coding assistants read and write Unreal Engine 5 Blueprint assets. Works with any UE5 5.4+ project.

## Getting Started

```bash
cd YourProject/Plugins
git clone https://github.com/mirno-ehf/ue5-mcp.git BlueprintMCP
```

Then tell Claude Code: **"Set up BlueprintMCP"** — it reads the plugin's `CLAUDE.md` and handles the rest.

Requires Node.js 18+ and UE5 5.4+.

## How It Works

A UE5 editor plugin hosts an HTTP server. A TypeScript MCP wrapper translates between the MCP protocol and that server. When the editor is open, it runs inside the editor process with zero overhead. When the editor is closed, it can spawn a headless process instead.

## License

[MIT](LICENSE)
