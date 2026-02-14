# BlueprintMCP

An Unreal Engine 5 editor plugin that exposes Blueprint assets to AI coding assistants via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Inspect, search, and modify Blueprint graphs programmatically from tools like Claude Code.

## Features

- Read and search Blueprint assets across your project
- Add, delete, and reconnect nodes in Blueprint graphs
- Change variable types, function parameters, and struct node types
- Snapshot and restore graph state for safe bulk edits
- Validate Blueprints and analyze C++ rebuild impact
- Works with both regular Blueprints and level Blueprints

## Prerequisites

- Unreal Engine 5.4+
- Node.js 18+
- An MCP-compatible AI client (e.g. Claude Code, Claude Desktop)

## Installation

1. Clone this repo into your project's `Plugins/` directory:
   ```bash
   cd YourProject/Plugins
   git clone https://github.com/yourusername/BlueprintMCP.git
   ```

2. Build the TypeScript MCP server:
   ```bash
   cd BlueprintMCP/Tools
   npm install
   npm run build
   ```

3. Rebuild your UE5 project (the C++ plugin compiles automatically).

## Serving Modes

The plugin has two serving modes:

### Editor mode (preferred)

When the UE5 editor is open, the `UBlueprintMCPEditorSubsystem` automatically starts an HTTP server on port 9847. MCP tools connect instantly with zero startup time and no extra memory overhead.

### Commandlet fallback

When the editor is closed, the TypeScript wrapper spawns a standalone `UnrealEditor-Cmd.exe` commandlet process (~2-4 GB RAM, ~60s startup). Call the `shutdown_server` tool to free this memory when done.

## MCP Client Configuration

Add to your MCP client config (e.g. `claude_desktop_config.json` or `.mcp.json`):

```json
{
  "mcpServers": {
    "blueprint-mcp": {
      "command": "node",
      "args": ["Plugins/BlueprintMCP/Tools/dist/index.js"],
      "env": {
        "UE_PROJECT_DIR": "C:/path/to/YourProject"
      }
    }
  }
}
```

Set `UE_PROJECT_DIR` to the directory containing your `.uproject` file.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_blueprints` | List all Blueprint assets, optionally filtered by name or parent class |
| `get_blueprint` | Get full details of a Blueprint: variables, graphs, nodes, connections |
| `get_blueprint_graph` | Get a specific named graph from a Blueprint |
| `get_blueprint_summary` | Concise human-readable summary (~1-2K chars vs 300K+ raw JSON) |
| `describe_graph` | Pseudo-code description of a graph's control and data flow |
| `search_blueprints` | Search across Blueprints for matching nodes |
| `search_by_type` | Find all usages of a specific type across Blueprints |
| `find_asset_references` | Find all assets that reference a given asset path |
| `add_node` | Add a node (BreakStruct, MakeStruct, CallFunction, etc.) |
| `delete_node` | Remove a node and disconnect all pins |
| `connect_pins` | Wire two pins together with type validation |
| `disconnect_pin` | Break connections on a pin |
| `set_pin_default` | Set the default value of an input pin |
| `set_blueprint_default` | Set a default property on a Blueprint's CDO |
| `change_variable_type` | Change a member variable's type |
| `change_function_parameter_type` | Change a function/event parameter's type |
| `change_struct_node_type` | Change a Break/Make struct node to a different struct |
| `remove_function_parameter` | Remove a parameter from a function or event |
| `replace_function_calls` | Redirect function calls from one library to another |
| `refresh_all_nodes` | Refresh all nodes after modifications |
| `rename_asset` | Rename or move a Blueprint and update references |
| `reparent_blueprint` | Change a Blueprint's parent class |
| `delete_asset` | Delete a .uasset file (checks for references first) |
| `validate_blueprint` | Compile and report errors/warnings without saving |
| `validate_all_blueprints` | Bulk-validate all Blueprints |
| `snapshot_graph` | Create a backup snapshot of a graph's state |
| `diff_graph` | Compare current state against a snapshot |
| `restore_graph` | Reconnect severed pin connections from a snapshot |
| `find_disconnected_pins` | Scan for pins that should be connected but aren't |
| `analyze_rebuild_impact` | Predict which Blueprints a C++ rebuild will affect |
| `server_status` | Check server status (starts if not running) |
| `shutdown_server` | Shut down the standalone commandlet to free memory |

## Architecture

```
MCP Client (Claude Code, etc.)
    |  MCP protocol (stdio)
    v
Tools/dist/index.js  (TypeScript MCP server)
    |  HTTP calls to localhost:9847
    v
BlueprintMCPServer.cpp  (C++ HTTP backend inside UE5)
    |  UE5 Blueprint APIs
    v
Blueprint assets (.uasset)
```

## License

MIT
