/**
 * Preview chat command
 */

import * as vscode from "vscode";
import { showConversationPicker, showConversationPreview, showError } from "../ui";
import { loadConversation } from "../parser";

/**
 * Command: Preview a conversation in a webview
 */
export async function previewChat(
  conversationId?: string,
  extensionUri?: vscode.Uri
): Promise<void> {
  try {
    // If no ID provided, show picker
    if (!conversationId) {
      conversationId = await showConversationPicker();
      if (!conversationId) {
        return;
      }
    }

    // Get settings
    const config = vscode.workspace.getConfiguration("cursor-chat-exporter");
    const includeTools = config.get<boolean>("includeToolCalls", false);

    // Load conversation (sync)
    const conversation = loadConversation(conversationId, includeTools);
    if (!conversation) {
      showError("Failed to load conversation. It may be empty or corrupted.");
      return;
    }

    // Show preview
    if (extensionUri) {
      showConversationPreview(conversation, extensionUri);
    } else {
      // Fallback: open as markdown in new document
      const content = generatePreviewMarkdown(conversation);
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc, { preview: true });
    }
  } catch (error) {
    showError(`Preview failed: ${error}`);
  }
}

/**
 * Generate markdown preview content
 */
function generatePreviewMarkdown(conversation: {
  name: string;
  bubbles: Array<{ type: string; text: string; toolName?: string }>;
}): string {
  const lines: string[] = [];

  lines.push(`# 💬 ${conversation.name}`);
  lines.push("");

  for (const bubble of conversation.bubbles) {
    if (bubble.type === "user") {
      lines.push("## 👤 User");
      lines.push("");
      lines.push(bubble.text);
      lines.push("");
    } else if (bubble.type === "ai") {
      lines.push("## 🤖 Assistant");
      lines.push("");
      lines.push(bubble.text);
      lines.push("");
    } else if (bubble.type === "tool") {
      lines.push(`### 🔧 ${bubble.toolName || "Tool"}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
