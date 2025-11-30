/**
 * QuickPick UI for selecting conversations
 */

import * as vscode from "vscode";
import { ExportFormat } from "../parser/types";
import { listConversations } from "../parser";
import { formatDateTimeFriendly } from "../utils/dateUtils";

interface ConversationQuickPickItem extends vscode.QuickPickItem {
  conversationId: string;
}

interface FormatQuickPickItem extends vscode.QuickPickItem {
  format: ExportFormat;
}

/**
 * Show conversation picker
 */
export async function showConversationPicker(): Promise<string | undefined> {
  const quickPick = vscode.window.createQuickPick<ConversationQuickPickItem>();
  quickPick.placeholder = "Loading conversations...";
  quickPick.busy = true;
  quickPick.show();

  try {
    // Get max conversations from settings
    const config = vscode.workspace.getConfiguration("cursor-chat-exporter");
    const maxConversations = config.get<number>("maxConversations", 50);

    // Load conversations (sync)
    const conversations = listConversations(maxConversations);

    if (conversations.length === 0) {
      vscode.window.showWarningMessage("No Cursor conversations found.");
      quickPick.hide();
      return undefined;
    }

    // Convert to QuickPick items
    const items: ConversationQuickPickItem[] = conversations.map((conv) => ({
      label: `📄 ${conv.name}`,
      description: `${conv.messageCount} messages`,
      detail: `${formatDateTimeFriendly(conv.updatedAt)} • ${conv.preview}`,
      conversationId: conv.id,
    }));

    quickPick.items = items;
    quickPick.placeholder = "Select a conversation to export";
    quickPick.busy = false;

    // Wait for selection
    return new Promise((resolve) => {
      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        quickPick.hide();
        resolve(selected?.conversationId);
      });

      quickPick.onDidHide(() => {
        resolve(undefined);
      });
    });
  } catch (error) {
    quickPick.hide();
    vscode.window.showErrorMessage(`Failed to load conversations: ${error}`);
    return undefined;
  }
}

/**
 * Show format picker
 */
export async function showFormatPicker(): Promise<ExportFormat | undefined> {
  const items: FormatQuickPickItem[] = [
    {
      label: "📝 LLM Format (.txt)",
      description: "Best for sharing with AI assistants",
      detail: "Uses [USER] and [ASSISTANT] tags for clear role separation",
      format: "llm",
    },
    {
      label: "📋 Markdown (.md)",
      description: "Human-readable with formatting",
      detail: "Rich formatting with emoji headers and tables",
      format: "markdown",
    },
    {
      label: "📊 JSON Lines (.jsonl)",
      description: "Programmatic/API use",
      detail: "One JSON object per line, easy to parse",
      format: "jsonl",
    },
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select export format",
  });

  return selected?.format;
}

/**
 * Show multiple conversation picker (for export all)
 */
export async function showMultiConversationPicker(): Promise<
  string[] | undefined
> {
  const quickPick = vscode.window.createQuickPick<ConversationQuickPickItem>();
  quickPick.placeholder = "Loading conversations...";
  quickPick.canSelectMany = true;
  quickPick.busy = true;
  quickPick.show();

  try {
    const conversations = listConversations(100);

    if (conversations.length === 0) {
      vscode.window.showWarningMessage("No Cursor conversations found.");
      quickPick.hide();
      return undefined;
    }

    const items: ConversationQuickPickItem[] = conversations.map((conv) => ({
      label: `📄 ${conv.name}`,
      description: `${conv.messageCount} messages`,
      detail: formatDateTimeFriendly(conv.updatedAt),
      conversationId: conv.id,
    }));

    quickPick.items = items;
    quickPick.placeholder = "Select conversations to export (use Space to select)";
    quickPick.busy = false;

    return new Promise((resolve) => {
      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems.map(
          (item) => item.conversationId
        );
        quickPick.hide();
        resolve(selected.length > 0 ? selected : undefined);
      });

      quickPick.onDidHide(() => {
        resolve(undefined);
      });
    });
  } catch (error) {
    quickPick.hide();
    vscode.window.showErrorMessage(`Failed to load conversations: ${error}`);
    return undefined;
  }
}
