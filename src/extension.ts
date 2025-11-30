/**
 * Cursor Chat Exporter Extension
 * 
 * Export your Cursor AI conversations to LLM-friendly formats with one click.
 */

import * as vscode from 'vscode';
import { registerCommands } from './commands';
import {
  createStatusBarButton,
  updateStatusBarVisibility,
  disposeStatusBar,
  disposePreviewPanel
} from './ui';
import { closeDatabase, databaseExists, getCursorDatabasePath } from './database';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Cursor Chat Exporter is now active!');

  // Check if Cursor database exists
  if (!databaseExists()) {
    vscode.window.showWarningMessage(
      `Cursor database not found at: ${getCursorDatabasePath()}\n` +
        'Make sure Cursor is installed and has been used at least once.'
    );
  }

  // Register all commands
  const commandDisposables = registerCommands(context);
  context.subscriptions.push(...commandDisposables);

  // Create status bar button
  const statusBarItem = createStatusBarButton();
  context.subscriptions.push(statusBarItem);

  // Listen for configuration changes
  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('cursor-chat-exporter.showStatusBarButton')) {
      updateStatusBarVisibility();
    }
  });
  context.subscriptions.push(configWatcher);

  // Show welcome message on first install
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome');
  if (!hasShownWelcome) {
    vscode.window
      .showInformationMessage(
        '🎉 Cursor Chat Exporter installed! Use Cmd+Shift+E to export chats.',
        'List Chats',
        'Settings'
      )
      .then((action) => {
        if (action === 'List Chats') {
          vscode.commands.executeCommand('cursor-chat-exporter.listChats');
        } else if (action === 'Settings') {
          vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'cursor-chat-exporter'
          );
        }
      });
    context.globalState.update('hasShownWelcome', true);
  }
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  console.log('Cursor Chat Exporter is now deactivated.');

  // Clean up resources
  closeDatabase();
  disposeStatusBar();
  disposePreviewPanel();
}

