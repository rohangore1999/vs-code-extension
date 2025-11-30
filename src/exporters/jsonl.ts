/**
 * JSON Lines export format
 * One JSON object per line, suitable for programmatic use
 */

import { BaseExporter } from './base';
import { Conversation, ExportFormat, Bubble } from '../parser/types';

interface JSONLMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
  tool_name?: string;
  tool_args?: Record<string, unknown>;
  tool_result?: string;
}

interface JSONLConversation {
  id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export class JSONLExporter extends BaseExporter {
  readonly format: ExportFormat = 'jsonl';
  readonly extension = '.jsonl';

  export(conversation: Conversation): string {
    const lines: string[] = [];

    // First line: conversation metadata
    const meta: JSONLConversation = {
      id: conversation.id,
      created_at: conversation.createdAt.toISOString(),
      updated_at: conversation.updatedAt.toISOString(),
      message_count: conversation.bubbles.length
    };
    lines.push(JSON.stringify(meta));

    // One line per message
    for (const bubble of conversation.bubbles) {
      const message = this.bubbleToJSONL(bubble);
      lines.push(JSON.stringify(message));
    }

    return lines.join('\n');
  }

  private bubbleToJSONL(bubble: Bubble): JSONLMessage {
    const message: JSONLMessage = {
      role: bubble.type === 'ai' ? 'assistant' : bubble.type,
      content: bubble.text,
      timestamp: bubble.createdAt
    };

    if (bubble.type === 'tool') {
      message.tool_name = bubble.toolName;
      message.tool_args = bubble.toolArgs;
      message.tool_result = bubble.toolResult;
    }

    return message;
  }
}

