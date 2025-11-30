/**
 * List all chats command
 */

import * as vscode from 'vscode';
import { showConversationPicker } from '../ui';
import { exportChat } from './exportChat';

/**
 * Command: List all chats and allow selection
 */
export async function listChats(): Promise<void> {
  const conversationId = await showConversationPicker();

  if (conversationId) {
    // Ask what to do with the selected conversation
    const action = await vscode.window.showQuickPick(
      [
        { label: '📤 Export', description: 'Export to file', action: 'export' },
        { label: '👁️ Preview', description: 'Preview in editor', action: 'preview' }
      ],
      { placeHolder: 'What would you like to do?' }
    );

    if (action?.action === 'export') {
      await exportChat(conversationId);
    } else if (action?.action === 'preview') {
      await vscode.commands.executeCommand(
        'cursor-chat-exporter.previewChat',
        conversationId
      );
    }
  }
}

