# BlueprintMCP

A UE5 editor plugin that lets AI coding assistants (Claude Code, Claude Desktop, etc.) inspect and modify Blueprint assets via the [Model Context Protocol](https://modelcontextprotocol.io).

32 tools covering read/search, node manipulation, type changes, snapshot/restore, validation, and C++ rebuild impact analysis. Works with any UE5 5.4+ project — no game-specific dependencies.

Two serving modes: **editor subsystem** (zero overhead when the UE5 editor is open) or **standalone commandlet** (headless, ~2-4 GB RAM).

---

## Setup Instructions

> **For AI assistants:** Follow these steps sequentially to fully configure BlueprintMCP for a UE5 project. Each step includes a verification command. Do not skip verification.

### Prerequisites

| Requirement | How to check | Notes |
|-------------|-------------|-------|
| UE5 5.4+ | `ls "C:/Program Files/Epic Games/UE_5.4/"` or check custom install path | The plugin uses Editor-only modules (`UnrealEd`, `BlueprintGraph`, `KismetCompiler`) |
| Node.js 18+ | `node --version` | Required for the TypeScript MCP server |
| npm | `npm --version` | Comes with Node.js |

### Step 1: Verify plugin location

The plugin must be inside a UE5 project's `Plugins/` directory. The expected layout is:

```
<ProjectRoot>/
  <ProjectName>.uproject
  Plugins/
    BlueprintMCP/          <-- this repo
      BlueprintMCP.uplugin
      Source/
      Tools/
```

**Verify:** From the project root, run:
```bash
ls Plugins/BlueprintMCP/BlueprintMCP.uplugin
```
This must succeed. If it doesn't, the plugin is not in the right location.

**Find the project root** by locating the `.uproject` file:
```bash
ls *.uproject
```

### Step 2: Build the TypeScript MCP server

```bash
cd Plugins/BlueprintMCP/Tools
npm install
npm run build
```

**Verify:**
```bash
ls Plugins/BlueprintMCP/Tools/dist/index.js
```
The file must exist. If `npm run build` fails, check that `tsconfig.json` exists and TypeScript is in `devDependencies`.

### Step 3: Configure the MCP client

Create or update `.mcp.json` in the **project root** (the directory containing the `.uproject` file):

```json
{
  "mcpServers": {
    "blueprint-mcp": {
      "command": "node",
      "args": ["Plugins/BlueprintMCP/Tools/dist/index.js"],
      "env": {
        "UE_PROJECT_DIR": "."
      }
    }
  }
}
```

If a `.mcp.json` already exists, merge the `blueprint-mcp` key into the existing `mcpServers` object.

**Why the project root?** Claude Code discovers `.mcp.json` by searching the working directory and parent directories. It does not search subdirectories, so placing it inside `Plugins/BlueprintMCP/` would not work.

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `UE_PROJECT_DIR` | `process.cwd()` | Directory containing the `.uproject` file. Set to `"."` when `.mcp.json` is at project root. |
| `UE_PORT` | `9847` | HTTP port for the C++ backend. Change if port 9847 is in use. |
| `UE_EDITOR_CMD` | Auto-detected from `C:\Program Files\Epic Games\UE_5.4\...` | Full path to `UnrealEditor-Cmd.exe`. Only needed for commandlet mode if UE5 is installed in a non-standard location. |

**For Claude Desktop** (uses absolute paths in `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "blueprint-mcp": {
      "command": "node",
      "args": ["C:/absolute/path/to/YourProject/Plugins/BlueprintMCP/Tools/dist/index.js"],
      "env": {
        "UE_PROJECT_DIR": "C:/absolute/path/to/YourProject"
      }
    }
  }
}
```

### Step 4: Build the C++ plugin

The C++ plugin compiles automatically when the UE5 editor opens the project. No manual build step is required unless you want to pre-compile.

**Optional pre-compile** (replace `YourProjectEditor` and the path):
```bash
"C:\Program Files\Epic Games\UE_5.4\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.exe" YourProjectEditor Win64 Development -Project="C:\path\to\YourProject.uproject" -WaitMutex
```

### Step 5: Verify end-to-end

1. Open the UE5 project in the editor.
2. The plugin auto-starts an HTTP server on port 9847.
3. From the MCP client, call the `server_status` tool. Expected response: the server reports it is running in editor mode.

If the editor is not open, calling any tool will attempt to spawn a commandlet process (requires `UnrealEditor-Cmd.exe` to be findable).

---

## Available Tools

### Reading & Searching

| Tool | Description |
|------|-------------|
| `list_blueprints` | List all Blueprint assets, optionally filtered by name or parent class |
| `get_blueprint` | Full details: variables, graphs, nodes, connections |
| `get_blueprint_graph` | Get a specific named graph (e.g. `EventGraph`, a function name) |
| `get_blueprint_summary` | Concise summary (~1-2K chars vs 300K+ raw JSON) |
| `describe_graph` | Pseudo-code description of control and data flow |
| `search_blueprints` | Search across Blueprints for matching nodes |
| `search_by_type` | Find all usages of a specific type across Blueprints |
| `find_asset_references` | Find all assets referencing a given asset path |

### Modifying

| Tool | Description |
|------|-------------|
| `add_node` | Add a node (BreakStruct, MakeStruct, CallFunction, VariableGet/Set, DynamicCast, etc.) |
| `delete_node` | Remove a node and disconnect all pins |
| `connect_pins` | Wire two pins together with type validation |
| `disconnect_pin` | Break connections on a pin |
| `set_pin_default` | Set the default value of an input pin |
| `set_blueprint_default` | Set a default property on a Blueprint's Class Default Object |
| `change_variable_type` | Change a member variable's type |
| `change_function_parameter_type` | Change a function/event parameter's type |
| `change_struct_node_type` | Change a Break/Make struct node to a different struct |
| `remove_function_parameter` | Remove a parameter from a function or event |
| `replace_function_calls` | Redirect function calls from one library to another |
| `refresh_all_nodes` | Refresh all nodes after modifications |
| `rename_asset` | Rename/move a Blueprint and update references |
| `reparent_blueprint` | Change a Blueprint's parent class |
| `delete_asset` | Delete a .uasset file (checks references first) |

### Validation & Safety

| Tool | Description |
|------|-------------|
| `validate_blueprint` | Compile and report errors/warnings without saving |
| `validate_all_blueprints` | Bulk-validate all (or filtered) Blueprints |
| `snapshot_graph` | Back up a graph's state before destructive operations |
| `diff_graph` | Compare current state against a snapshot |
| `restore_graph` | Reconnect severed pin connections from a snapshot |
| `find_disconnected_pins` | Scan for pins that should be connected but aren't |
| `analyze_rebuild_impact` | Predict which Blueprints a C++ rebuild will affect |

### Server Management

| Tool | Description |
|------|-------------|
| `server_status` | Check server status (starts if not running) |
| `shutdown_server` | Shut down the standalone commandlet to free memory |

---

## Architecture

```
MCP Client (stdio)
    |
Tools/dist/index.js        TypeScript: tool schemas, response formatting, process lifecycle
    |  HTTP :9847
BlueprintMCPServer.cpp      C++: Blueprint manipulation via UE5 engine APIs
    |
.uasset files
```

## License

[MIT](LICENSE)
