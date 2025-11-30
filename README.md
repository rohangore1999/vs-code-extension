# Cursor Chat Exporter

Export your Cursor AI conversations to LLM-friendly formats with one click.

## Features

- **📤 One-Click Export**: Export any Cursor conversation to a file
- **📋 Multiple Formats**: LLM-optimized, Markdown, or JSON Lines
- **👁️ Preview**: Preview conversations before exporting
- **⌨️ Keyboard Shortcuts**: Quick access with `Cmd+Shift+E`
- **📊 Bulk Export**: Export multiple conversations at once

## Usage

### Quick Export
1. Press `Cmd+Shift+E` (or `Ctrl+Shift+E` on Windows/Linux)
2. Select a conversation from the list
3. Choose your export format
4. Save the file

### Commands
- **Cursor: List All Chats** (`Cmd+Shift+L`) - Browse all conversations
- **Cursor: Export Chat** (`Cmd+Shift+E`) - Export a single conversation
- **Cursor: Export Recent Chat** - Export the most recent conversation
- **Cursor: Export All Chats** - Bulk export multiple conversations
- **Cursor: Preview Chat** - Preview a conversation before exporting

### Export Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| **LLM** | `.txt` | Sharing with AI assistants (ChatGPT, Claude, etc.) |
| **Markdown** | `.md` | Human-readable documentation |
| **JSON Lines** | `.jsonl` | Programmatic/API use |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `cursor-chat-exporter.defaultExportPath` | `""` | Default folder for exports |
| `cursor-chat-exporter.defaultFormat` | `"llm"` | Default export format |
| `cursor-chat-exporter.includeToolCalls` | `false` | Include tool calls in export |
| `cursor-chat-exporter.showStatusBarButton` | `true` | Show export button in status bar |
| `cursor-chat-exporter.maxConversations` | `50` | Max conversations in picker |

## LLM Format Example

```
# Conversation Export
ID: e7182b1d-c34f-4b4e-a84f-9d4cd552e924
Date: 2025-11-29 14:01:17
Messages: 42

---

[USER]
How do I fix this bug in my code?

[ASSISTANT]
Looking at your code, the issue is in the authentication flow...

[USER]
That worked! Thanks!

---
Stats: 20 user, 22 assistant
```

## Requirements

- Cursor IDE installed
- At least one conversation in Cursor chat history

## Known Issues

- Active/streaming conversations may not be fully captured (they're stored in memory, not yet persisted to database)
- Very large conversations may take a moment to load

## Release Notes

### 0.0.1
- Initial release
- Export to LLM, Markdown, and JSON Lines formats
- Conversation picker with search
- Preview panel
- Status bar button

## License

MIT

