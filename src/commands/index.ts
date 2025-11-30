/**
 * Commands module - register all commands
 */

import * as vscode from 'vscode';
import { listChats } from './listChats';
import { exportChat } from './exportChat';
import { exportRecent } from './exportRecent';
import { exportAll } from './exportAll';
import { previewChat } from './previewChat';

/**
 * Register all extension commands
 */
export function registerCommands(
  context: vscode.ExtensionContext
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // List all chats
  disposables.push(
    vscode.commands.registerCommand('cursor-chat-exporter.listChats', listChats)
  );

  // Export chat
  disposables.push(
    vscode.commands.registerCommand('cursor-chat-exporter.exportChat', exportChat)
  );

  // Export recent
  disposables.push(
    vscode.commands.registerCommand('cursor-chat-exporter.exportRecent', exportRecent)
  );

  // Export all
  disposables.push(
    vscode.commands.registerCommand('cursor-chat-exporter.exportAll', exportAll)
  );

  // Preview chat
  disposables.push(
    vscode.commands.registerCommand(
      'cursor-chat-exporter.previewChat',
      (conversationId?: string) => previewChat(conversationId, context.extensionUri)
    )
  );

  return disposables;
}

export { listChats, exportChat, exportRecent, exportAll, previewChat };

