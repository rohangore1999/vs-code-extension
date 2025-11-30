/**
 * Export chat command
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  showConversationPicker,
  showFormatPicker,
  showExportSuccess,
  showError,
  withProgress,
} from "../ui";
import { loadConversation } from "../parser";
import { getExporter } from "../exporters";
import { ExportFormat } from "../parser/types";

/**
 * Command: Export a conversation
 */
export async function exportChat(conversationId?: string): Promise<void> {
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
    const defaultFormat = config.get<ExportFormat>("defaultFormat", "llm");
    const includeTools = config.get<boolean>("includeToolCalls", false);
    const defaultPath = config.get<string>("defaultExportPath", "");

    // Ask for format (or use default)
    let format: ExportFormat | undefined = defaultFormat;
    const useDefaultFormat = await vscode.window.showQuickPick(
      [
        { label: "Use default format", value: true },
        { label: "Choose format...", value: false },
      ],
      { placeHolder: `Default format: ${defaultFormat}` }
    );

    if (useDefaultFormat && !useDefaultFormat.value) {
      format = await showFormatPicker();
      if (!format) {
        return;
      }
    }

    // Load and export conversation
    await withProgress("Exporting conversation...", async (progress) => {
      progress.report({ message: "Loading conversation..." });

      const conversation = loadConversation(conversationId!, includeTools);
      if (!conversation) {
        showError("Failed to load conversation. It may be empty or corrupted.");
        return;
      }

      progress.report({ message: "Generating export..." });

      // Get exporter
      const exporter = getExporter(format!);
      const content = exporter.export(conversation);
      const filename = exporter.getFilename(conversation);

      progress.report({ message: "Saving file..." });

      // Determine save location
      let savePath: string;

      if (defaultPath) {
        // Use default path
        const expandedPath = defaultPath.replace(/^~/, process.env.HOME || "");
        if (!fs.existsSync(expandedPath)) {
          fs.mkdirSync(expandedPath, { recursive: true });
        }
        savePath = path.join(expandedPath, filename);
      } else {
        // Ask user for save location
        const uri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(
            path.join(
              vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
                process.env.HOME ||
                "",
              filename
            )
          ),
          filters: {
            "Text files": ["txt"],
            Markdown: ["md"],
            "JSON Lines": ["jsonl"],
            "All files": ["*"],
          },
        });

        if (!uri) {
          return;
        }

        savePath = uri.fsPath;
      }

      // Write file
      fs.writeFileSync(savePath, content, "utf-8");

      // Show success
      await showExportSuccess(filename, savePath);
    });
  } catch (error) {
    showError(`Export failed: ${error}`);
  }
}
