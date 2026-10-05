# 21st MCP — UI Components for AI Coding Agents

> Connect Cursor, Claude Code, Devin, or any MCP client to the 21st catalog: search 12,000+ React components and install them without leaving your editor. Formerly known as Magic MCP — the @21st-dev/magic package still works.

## Setup

```bash
npx @21st-dev/cli@latest init --client <cursor|claude|codex|vscode|devin>
```
`windsurf` remains an alias for `devin`.

This prints (or, with `--write`, writes) your client's config for the 21st MCP server (endpoint https://21st.dev/api/mcp) with a placeholder for the API key. Create the key itself at https://21st.dev/mcp and paste it in.

## CLI

The same package installs a standalone CLI (`21st`) for publishing and managing components from the terminal — draft, publish, edit libraries, review status, all without opening Studio. Full reference: https://21st.dev/.well-known/skills/21st-cli-use/SKILL.md

## Core MCP tools

- `search` — Search the catalog across components, themes, and templates — free, metadata only.
- `get_component` — Retrieve a component's code by id (paid retrieval).
- `get_inspiration` — Search reranked against a project's Design Context (stack, tokens, prior decisions).
- `search_logo` — Search brand/UI SVG logos by name — free, no retrieval limit.
- `generate` — Generate a new UI from a prompt with 21st AI (paid on the free tier).

This is a representative slice, not the full tool list — an MCP client gets the authoritative, current list from the server's own `tools/list`.

Full documentation: https://21st.dev/llms.txt · Setup UI + API key: https://21st.dev/mcp
