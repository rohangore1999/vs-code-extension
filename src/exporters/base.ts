/**
 * Base exporter class
 */

import { Conversation, ExportFormat } from '../parser/types';

export abstract class BaseExporter {
  abstract readonly format: ExportFormat;
  abstract readonly extension: string;

  /**
   * Export conversation to string
   */
  abstract export(conversation: Conversation): string;

  /**
   * Get the filename for the export
   */
  getFilename(conversation: Conversation): string {
    const date = conversation.createdAt;
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;

    // Sanitize conversation ID
    const shortId = conversation.id.substring(0, 8);

    return `cursor_chat_${shortId}_${dateStr}_${timeStr}${this.extension}`;
  }
}

