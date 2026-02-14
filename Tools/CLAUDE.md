# Blueprint MCP - Development Instructions

## Build Requirements

**After ANY change to TypeScript or C++ files, you MUST build and verify before considering the work done.**

### TypeScript (MCP Server)

```bash
cd Plugins/BlueprintMCP/Tools
npm run build
```

This runs `tsc` and outputs to `dist/index.js`. The MCP server runs from `dist/`, not `src/` — changes to `src/index.ts` have no effect until built.

If the build fails with EPERM on dist files (Perforce read-only), clear the attribute first:
```bash
attrib -R "Plugins\BlueprintMCP\Tools\dist\index.js"
attrib -R "Plugins\BlueprintMCP\Tools\dist\index.js.map"
```

### C++ (UE5 HTTP Backend)

The C++ code lives in `Plugins/BlueprintMCP/Source/BlueprintMCP/`:
- `Public/BlueprintMCPServer.h` — handler declarations
- `Private/BlueprintMCPServer.cpp` — all HTTP endpoint implementations
- `BlueprintMCP.Build.cs` — module dependencies

Build from the project root:
```bash
# Using UE5 Build Tool (UnrealBuildTool)
"C:\Program Files\Epic Games\UE_5.4\Engine\Build\BatchFiles\Build.bat" <YourProject>Editor Win64 Development "<path\to\YourProject.uproject>" -waitmutex
```

Or open the project's `.sln` file in Visual Studio and build the **Development Editor | Win64** configuration (Ctrl+Shift+B).

If C++ source files are read-only (Perforce), clear the attribute before editing:
```bash
attrib -R "Plugins\BlueprintMCP\Source\BlueprintMCP\Private\BlueprintMCPServer.cpp"
attrib -R "Plugins\BlueprintMCP\Source\BlueprintMCP\Public\BlueprintMCPServer.h"
```

## Architecture

```
src/index.ts (TypeScript MCP server)
    ↓ HTTP calls to localhost:9847
BlueprintMCPServer.cpp (C++ HTTP backend inside UE5)
```

- **TypeScript side** (`src/index.ts`): Defines MCP tools, formats responses, manages UE5 process lifecycle. Changes here affect tool schemas, descriptions, response formatting, and the workflow recipes resource.
- **C++ side** (`BlueprintMCPServer.cpp`): Handles all actual Blueprint manipulation via UE5 APIs. Changes here affect what operations are possible and what data is returned.

Adding a new tool requires changes to BOTH files:
1. C++: Add handler method declaration in `.h`, implement in `.cpp`, bind route in `Start()`, dispatch in `ProcessOneRequest()`
2. TypeScript: Add `server.tool(...)` definition with schema, HTTP call, and response formatting

## Coding Patterns

### C++ Handlers

Follow the existing pattern exactly:
- Parse JSON body with `ParseBodyJson()` or read query params
- Validate required fields, return `MakeErrorJson()` on failure
- Load blueprint with `LoadBlueprintByName()` which handles both regular BPs and level blueprints
- Use SEH wrappers (`TryCompileBlueprintSEH`, `TrySavePackageSEH`) for crash safety on Windows
- Save with `SaveBlueprintPackage()` which handles compilation, map packages, and read-only files
- Return JSON via `JsonToString()` with consistent field naming
- Log operations with `UE_LOG(LogTemp, Display, TEXT("BlueprintMCP: ..."))`

### TypeScript Tools

Follow the existing pattern:
- Call `ensureUE()` first to guarantee the backend is running
- Use `ueGet()` for read-only endpoints, `uePost()` for mutations
- Format responses as human-readable text (not raw JSON)
- Include `nextSteps` hints for mutation tools
- Support `dryRun` parameter on mutation tools where applicable

## Testing

1. **Type check only** (fast): `npx tsc --noEmit`
2. **Full build** (required): `npm run build`
3. **Runtime test**: Open the UE5 editor, then use any blueprint MCP tool from Claude Code — the editor subsystem auto-starts the HTTP server on port 9847

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | MCP server: tool definitions, response formatting, process management |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/Public/BlueprintMCPServer.h` | C++ handler declarations |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/Private/BlueprintMCPServer.cpp` | C++ HTTP endpoint implementations (~3700 lines) |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/BlueprintMCP.Build.cs` | UE5 module dependencies |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/Public/BlueprintMCPEditorSubsystem.h` | Editor subsystem header |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/Private/BlueprintMCPEditorSubsystem.cpp` | Editor subsystem that hosts the server |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/Public/BlueprintMCPCommandlet.h` | Standalone commandlet header |
| `Plugins/BlueprintMCP/Source/BlueprintMCP/Private/BlueprintMCPCommandlet.cpp` | Standalone commandlet for headless mode |
| `TODO.md` | Incident history and implemented features |
