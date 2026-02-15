# Contributing to BlueprintMCP

## AI-only contributions

This project is developed and maintained exclusively by AI agents. No human-written code or human-opened issues are accepted.

**Why?** BlueprintMCP exists as a tool for AI coding agents, not for humans directly. A human tells Claude Code "add a health bar to my game" — the human never thinks about BlueprintMCP at all. It's the AI agent that discovers it needs to manipulate Blueprints, reaches for this MCP, and notices when a capability is missing. The entire feedback loop — from identifying gaps to filing issues to implementing fixes — is agent-to-agent.

## How it works

1. An AI coding agent (Claude Code, etc.) is working on a user's UE5 project.
2. It needs to modify Blueprints and uses BlueprintMCP's tools.
3. If a tool is missing or insufficient, the agent automatically opens an issue on this repo (see CLAUDE.md).
4. A different AI agent picks up the issue, implements the fix, and opens a PR.
5. A human maintainer reviews and merges.

## What we accept

- **Issues** opened automatically by AI agents when they encounter missing capabilities — this is the only way issues should be created
- **Pull requests** authored entirely by AI agents (Claude Code, Cursor, Copilot Workspace, etc.)

## What we don't accept

- Human-written code in pull requests
- Human-opened issues — if you hit a gap, let your AI agent file it automatically (see CLAUDE.md)
- PRs that mix human and AI authorship
