/**
 * Export most recent chat command
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { showExportSuccess, showError, showWarning, withProgress } from "../ui";
import { getMostRecentConversation } from "../parser";
import { getExporter } from "../exporters";
import { ExportFormat } from "../parser/types";

/**
 * Command: Export the most recent conversation
 */
export async function exportRecent(): Promise<void> {
  try {
    // Get settings
    const config = vscode.workspace.getConfiguration("cursor-chat-exporter");
    const defaultFormat = config.get<ExportFormat>("defaultFormat", "llm");
    const includeTools = config.get<boolean>("includeToolCalls", false);
    const defaultPath = config.get<string>("defaultExportPath", "");

    await withProgress("Exporting recent conversation...", async (progress) => {
      progress.report({ message: "Finding most recent conversation..." });

      const conversation = getMostRecentConversation(includeTools);
      if (!conversation) {
        showWarning("No conversations found to export.");
        return;
      }

      progress.report({ message: "Generating export..." });

      // Get exporter
      const exporter = getExporter(defaultFormat);
      const content = exporter.export(conversation);
      const filename = exporter.getFilename(conversation);

      progress.report({ message: "Saving file..." });

      // Determine save location
      let savePath: string;

      if (defaultPath) {
        const expandedPath = defaultPath.replace(/^~/, process.env.HOME || "");
        if (!fs.existsSync(expandedPath)) {
          fs.mkdirSync(expandedPath, { recursive: true });
        }
        savePath = path.join(expandedPath, filename);
      } else {
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
