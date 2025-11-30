/**
 * Notification helpers
 */

import * as vscode from 'vscode';

/**
 * Show success notification with option to open file
 */
export async function showExportSuccess(
  filename: string,
  filePath: string
): Promise<void> {
  const action = await vscode.window.showInformationMessage(
    `✅ Exported: ${filename}`,
    'Open File',
    'Open Folder'
  );

  if (action === 'Open File') {
    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);
  } else if (action === 'Open Folder') {
    const folderUri = vscode.Uri.file(filePath).with({
      path: filePath.substring(0, filePath.lastIndexOf('/'))
    });
    await vscode.commands.executeCommand('revealFileInOS', folderUri);
  }
}

/**
 * Show error notification
 */
export function showError(message: string): void {
  vscode.window.showErrorMessage(`❌ ${message}`);
}

/**
 * Show warning notification
 */
export function showWarning(message: string): void {
  vscode.window.showWarningMessage(`⚠️ ${message}`);
}

/**
 * Show info notification
 */
export function showInfo(message: string): void {
  vscode.window.showInformationMessage(message);
}

/**
 * Show progress notification
 */
export async function withProgress<T>(
  title: string,
  task: (
    progress: vscode.Progress<{ message?: string; increment?: number }>
  ) => Promise<T>
): Promise<T> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: false
    },
    task
  );
}

