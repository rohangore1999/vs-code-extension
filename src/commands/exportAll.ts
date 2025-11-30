/**
 * Export all chats command
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  showMultiConversationPicker,
  showFormatPicker,
  showError,
  showInfo,
  withProgress,
} from "../ui";
import { loadConversation } from "../parser";
import { getExporter } from "../exporters";
import { ExportFormat } from "../parser/types";

/**
 * Command: Export multiple conversations
 */
export async function exportAll(): Promise<void> {
  try {
    // Show multi-select picker
    const conversationIds = await showMultiConversationPicker();
    if (!conversationIds || conversationIds.length === 0) {
      return;
    }

    // Get settings
    const config = vscode.workspace.getConfiguration("cursor-chat-exporter");
    const includeTools = config.get<boolean>("includeToolCalls", false);

    // Ask for format
    const format = await showFormatPicker();
    if (!format) {
      return;
    }

    // Ask for output folder
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select Export Folder",
      defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
    });

    if (!folderUri || folderUri.length === 0) {
      return;
    }

    const outputFolder = folderUri[0].fsPath;

    // Export all selected conversations
    await withProgress(
      `Exporting ${conversationIds.length} conversations...`,
      async (progress) => {
        const exporter = getExporter(format);
        let exported = 0;
        let failed = 0;

        for (let i = 0; i < conversationIds.length; i++) {
          const convId = conversationIds[i];
          progress.report({
            message: `Exporting ${i + 1}/${conversationIds.length}...`,
            increment: 100 / conversationIds.length,
          });

          try {
            const conversation = loadConversation(convId, includeTools);
            if (!conversation) {
              failed++;
              continue;
            }

            const content = exporter.export(conversation);
            const filename = exporter.getFilename(conversation);
            const savePath = path.join(outputFolder, filename);

            fs.writeFileSync(savePath, content, "utf-8");
            exported++;
          } catch (error) {
            console.error(`Failed to export ${convId}:`, error);
            failed++;
          }
        }

        // Show summary
        if (failed === 0) {
          showInfo(`✅ Exported ${exported} conversations to ${outputFolder}`);
        } else {
          showInfo(
            `Exported ${exported} conversations (${failed} failed) to ${outputFolder}`
          );
        }

        // Offer to open folder
        const action = await vscode.window.showInformationMessage(
          `Export complete!`,
          "Open Folder"
        );

        if (action === "Open Folder") {
          await vscode.commands.executeCommand(
            "revealFileInOS",
            vscode.Uri.file(outputFolder)
          );
        }
      }
    );
  } catch (error) {
    showError(`Export failed: ${error}`);
  }
}
