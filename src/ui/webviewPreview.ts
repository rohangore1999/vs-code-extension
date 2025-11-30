/**
 * Webview panel for previewing conversations before export
 */

import * as vscode from 'vscode';
import { Conversation } from '../parser/types';
import { formatDateTimeFriendly, formatTime } from '../utils/dateUtils';

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Show conversation preview in a webview panel
 */
export function showConversationPreview(
  conversation: Conversation,
  extensionUri: vscode.Uri
): vscode.WebviewPanel {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  // If we already have a panel, show it
  if (currentPanel) {
    currentPanel.reveal(column);
    currentPanel.webview.html = getWebviewContent(conversation);
    return currentPanel;
  }

  // Create new panel
  currentPanel = vscode.window.createWebviewPanel(
    'cursorChatPreview',
    `Chat: ${conversation.name.substring(0, 30)}...`,
    column || vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  currentPanel.webview.html = getWebviewContent(conversation);

  // Handle disposal
  currentPanel.onDidDispose(() => {
    currentPanel = undefined;
  });

  return currentPanel;
}

/**
 * Generate webview HTML content
 */
function getWebviewContent(conversation: Conversation): string {
  const messages = conversation.bubbles
    .map((bubble) => {
      const roleClass = bubble.type === 'user' ? 'user' : bubble.type === 'ai' ? 'assistant' : 'tool';
      const roleLabel = bubble.type === 'user' ? '👤 User' : bubble.type === 'ai' ? '🤖 Assistant' : `🔧 ${bubble.toolName}`;
      const time = formatTime(new Date(bubble.createdAt));

      // Escape HTML in text
      const escapedText = escapeHtml(bubble.text);

      return `
        <div class="message ${roleClass}">
          <div class="message-header">
            <span class="role">${roleLabel}</span>
            <span class="time">${time}</span>
          </div>
          <div class="message-content">${escapedText}</div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Preview</title>
  <style>
    :root {
      --bg-primary: #1e1e1e;
      --bg-secondary: #252526;
      --bg-user: #2d4a3e;
      --bg-assistant: #2d3a4a;
      --bg-tool: #3a3a2d;
      --text-primary: #cccccc;
      --text-secondary: #888888;
      --border-color: #404040;
      --accent: #569cd6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 20px;
      line-height: 1.6;
    }

    .header {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
    }

    .header h1 {
      font-size: 1.4em;
      margin-bottom: 10px;
      color: var(--accent);
    }

    .stats {
      display: flex;
      gap: 20px;
      color: var(--text-secondary);
      font-size: 0.9em;
    }

    .messages {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      padding: 16px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .message.user {
      background: var(--bg-user);
      border-left: 3px solid #4ec9b0;
    }

    .message.assistant {
      background: var(--bg-assistant);
      border-left: 3px solid #569cd6;
    }

    .message.tool {
      background: var(--bg-tool);
      border-left: 3px solid #dcdcaa;
      font-size: 0.9em;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 0.85em;
    }

    .role {
      font-weight: 600;
    }

    .time {
      color: var(--text-secondary);
    }

    .message-content {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 0.95em;
    }

    code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', 'Consolas', monospace;
    }

    pre {
      background: rgba(0,0,0,0.3);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💬 ${escapeHtml(conversation.name)}</h1>
    <div class="stats">
      <span>📅 ${formatDateTimeFriendly(conversation.createdAt)}</span>
      <span>💬 ${conversation.bubbles.length} messages</span>
      <span>👤 ${conversation.userMessageCount} user</span>
      <span>🤖 ${conversation.aiMessageCount} AI</span>
    </div>
  </div>
  
  <div class="messages">
    ${messages}
  </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Dispose the preview panel
 */
export function disposePreviewPanel(): void {
  if (currentPanel) {
    currentPanel.dispose();
    currentPanel = undefined;
  }
}

