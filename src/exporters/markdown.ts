/**
 * Markdown export format
 * Human-readable with emoji headers
 */

import { BaseExporter } from "./base";
import { Conversation, ExportFormat } from "../parser/types";
import { formatDateTime } from "../utils/dateUtils";

export class MarkdownExporter extends BaseExporter {
  readonly format: ExportFormat = "markdown";
  readonly extension = ".md";

  export(conversation: Conversation): string {
    const lines: string[] = [];

    // Header
    lines.push(`# 💬 ${conversation.name}`);
    lines.push("");
    lines.push("| Property | Value |");
    lines.push("|----------|-------|");
    lines.push(`| **ID** | \`${conversation.id}\` |`);
    lines.push(`| **Created** | ${formatDateTime(conversation.createdAt)} |`);
    lines.push(`| **Updated** | ${formatDateTime(conversation.updatedAt)} |`);
    lines.push(
      `| **Messages** | ${conversation.userMessageCount} user, ${conversation.aiMessageCount} AI |`
    );
    lines.push("");
    lines.push("---");
    lines.push("");

    // Messages
    for (const bubble of conversation.bubbles) {
      if (bubble.type === "user") {
        lines.push("## 👤 User");
        lines.push("");
        lines.push(bubble.text);
        lines.push("");
      } else if (bubble.type === "ai") {
        lines.push("## 🤖 Cursor AI");
        lines.push("");
        lines.push(bubble.text);
        lines.push("");
      } else if (bubble.type === "tool") {
        lines.push(`### 🔧 Tool: ${bubble.toolName || "unknown"}`);
        lines.push("");
        if (bubble.toolArgs) {
          lines.push("```json");
          lines.push(
            JSON.stringify(bubble.toolArgs, null, 2).substring(0, 500)
          );
          lines.push("```");
        }
        if (bubble.toolResult) {
          lines.push("");
          lines.push("**Result:**");
          lines.push("```");
          lines.push(bubble.toolResult.substring(0, 500));
          lines.push("```");
        }
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    }

    // Footer
    lines.push(`*Exported on ${formatDateTime(new Date())}*`);

    return lines.join("\n");
  }
}
