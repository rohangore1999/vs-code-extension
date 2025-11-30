/**
 * Status bar button for quick export access
 */

import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;

/**
 * Create and show the status bar button
 */
export function createStatusBarButton(): vscode.StatusBarItem {
  if (statusBarItem) {
    return statusBarItem;
  }

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  statusBarItem.text = '$(comment-discussion) Export Chat';
  statusBarItem.tooltip = 'Export Cursor Chat';
  statusBarItem.command = 'cursor-chat-exporter.exportChat';

  // Check settings to see if we should show
  updateStatusBarVisibility();

  return statusBarItem;
}

/**
 * Update status bar visibility based on settings
 */
export function updateStatusBarVisibility(): void {
  if (!statusBarItem) {
    return;
  }

  const config = vscode.workspace.getConfiguration('cursor-chat-exporter');
  const showButton = config.get<boolean>('showStatusBarButton', true);

  if (showButton) {
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

/**
 * Dispose the status bar button
 */
export function disposeStatusBar(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = undefined;
  }
}

