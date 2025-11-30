/**
 * Database queries for Cursor chat data
 */

import { query } from "./connection";
import { RawBubbleData, RawComposerData } from "../parser/types";

/**
 * Get all conversation IDs (composerData entries)
 */
export function getAllConversationIds(): string[] {
  const results = query<RawComposerData>(
    `SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'`
  );

  return results.map((row) => {
    // Extract conversation ID from key like "composerData:uuid"
    const parts = row.key.split(":");
    return parts[1] || row.key;
  });
}

/**
 * Get composer data for a specific conversation
 */
export function getComposerData(conversationId: string): string | null {
  const results = query<{ value: string }>(
    `SELECT value FROM cursorDiskKV WHERE key = 'composerData:${conversationId}'`
  );

  return results.length > 0 ? results[0].value : null;
}

/**
 * Get all bubbles for a conversation
 */
export function getBubblesForConversation(
  conversationId: string
): RawBubbleData[] {
  const results = query<RawBubbleData>(
    `SELECT key, value FROM cursorDiskKV WHERE key LIKE 'bubbleId:${conversationId}:%'`
  );

  return results;
}

/**
 * Get all conversations with their bubble counts (for listing)
 */
export function getConversationSummaries(): Array<{
  conversationId: string;
  bubbleCount: number;
}> {
  // Get all unique conversation IDs from bubbles
  const results = query<{ key: string }>(
    `SELECT DISTINCT key FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'`
  );

  // Group by conversation ID
  const conversationCounts = new Map<string, number>();

  for (const row of results) {
    // Key format: bubbleId:conversationId:bubbleId
    const parts = row.key.split(":");
    if (parts.length >= 2) {
      const convId = parts[1];
      conversationCounts.set(convId, (conversationCounts.get(convId) || 0) + 1);
    }
  }

  return Array.from(conversationCounts.entries()).map(
    ([conversationId, bubbleCount]) => ({
      conversationId,
      bubbleCount,
    })
  );
}

/**
 * Search for conversations containing specific text
 */
export function searchConversations(searchText: string): string[] {
  const escapedText = searchText.replace(/'/g, "''");
  const results = query<{ key: string }>(
    `SELECT DISTINCT key FROM cursorDiskKV WHERE key LIKE 'bubbleId:%' AND value LIKE '%${escapedText}%'`
  );

  const conversationIds = new Set<string>();
  for (const row of results) {
    const parts = row.key.split(":");
    if (parts.length >= 2) {
      conversationIds.add(parts[1]);
    }
  }

  return Array.from(conversationIds);
}
