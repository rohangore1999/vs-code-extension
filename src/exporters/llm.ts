/**
 * LLM-optimized export format
 * Uses [USER] and [ASSISTANT] tags for clear role separation
 */

import { BaseExporter } from "./base";
import { Conversation, ExportFormat } from "../parser/types";
import { formatDateTime } from "../utils/dateUtils";

export class LLMExporter extends BaseExporter {
  readonly format: ExportFormat = "llm";
  readonly extension = ".txt";

  export(conversation: Conversation): string {
    const lines: string[] = [];

    // Header
    lines.push("# Conversation Export");
    lines.push(`ID: ${conversation.id}`);
    lines.push(`Date: ${formatDateTime(conversation.createdAt)}`);
    lines.push(`Messages: ${conversation.bubbles.length}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    // Messages
    for (const bubble of conversation.bubbles) {
      if (bubble.type === "user") {
        lines.push("[USER]");
        lines.push(bubble.text);
        lines.push("");
      } else if (bubble.type === "ai") {
        lines.push("[ASSISTANT]");
        lines.push(bubble.text);
        lines.push("");
      } else if (bubble.type === "tool") {
        lines.push(`[TOOL: ${bubble.toolName || "unknown"}]`);
        if (bubble.toolArgs) {
          // Show key tool arguments
          const args = Object.entries(bubble.toolArgs)
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${String(v).substring(0, 50)}`)
            .join(", ");
          lines.push(args);
        }
        if (bubble.toolResult) {
          lines.push(`Result: ${bubble.toolResult.substring(0, 200)}...`);
        }
        lines.push("");
      }
    }

    // Footer stats
    lines.push("---");
    lines.push(
      `Stats: ${conversation.userMessageCount} user, ${conversation.aiMessageCount} assistant`
    );

    return lines.join("\n");
  }
}
