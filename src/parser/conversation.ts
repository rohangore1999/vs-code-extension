/**
 * Parse and manage conversations
 */

import { Bubble, Conversation, ConversationSummary } from "./types";
import { parseBubbles, filterContentBubbles } from "./bubble";
import { getBubblesForConversation, getConversationSummaries } from "../database";

/**
 * Load a full conversation with all its bubbles
 */
export function loadConversation(
  conversationId: string,
  includeTools: boolean = false
): Conversation | null {
  try {
    // Get raw bubbles from database
    const rawBubbles = getBubblesForConversation(conversationId);

    if (rawBubbles.length === 0) {
      return null;
    }

    // Parse and sort bubbles
    const allBubbles = parseBubbles(rawBubbles);

    // Filter to content bubbles only
    const bubbles = filterContentBubbles(allBubbles, includeTools);

    if (bubbles.length === 0) {
      return null;
    }

    // Calculate stats
    const userMessages = bubbles.filter((b) => b.type === "user");
    const aiMessages = bubbles.filter((b) => b.type === "ai");

    // Get first user message as name
    const firstUserMessage = userMessages[0];
    let name = "Untitled Conversation";
    if (firstUserMessage && firstUserMessage.text) {
      // Truncate to first 50 chars
      name = firstUserMessage.text.substring(0, 50);
      if (firstUserMessage.text.length > 50) {
        name += "...";
      }
    }

    // Get dates from first and last bubbles
    const createdAt = new Date(bubbles[0].createdAt);
    const updatedAt = new Date(bubbles[bubbles.length - 1].createdAt);

    return {
      id: conversationId,
      name,
      createdAt,
      updatedAt,
      bubbles,
      userMessageCount: userMessages.length,
      aiMessageCount: aiMessages.length,
    };
  } catch (error) {
    console.error("Error loading conversation:", error);
    return null;
  }
}

/**
 * Get summaries of all conversations for the picker
 */
export function listConversations(maxCount: number = 50): ConversationSummary[] {
  try {
    const summaries = getConversationSummaries();
    const results: ConversationSummary[] = [];

    for (const summary of summaries) {
      // Load just enough to get the name and preview
      const rawBubbles = getBubblesForConversation(summary.conversationId);
      const bubbles = parseBubbles(rawBubbles);
      const contentBubbles = filterContentBubbles(bubbles, false);

      if (contentBubbles.length === 0) {
        continue;
      }

      // Get first user message
      const firstUser = contentBubbles.find((b) => b.type === "user");
      let name = "Untitled Conversation";
      let preview = "";

      if (firstUser && firstUser.text) {
        name = firstUser.text.substring(0, 50);
        if (firstUser.text.length > 50) {
          name += "...";
        }
        preview = firstUser.text.substring(0, 100);
        if (firstUser.text.length > 100) {
          preview += "...";
        }
      }

      results.push({
        id: summary.conversationId,
        name,
        createdAt: new Date(contentBubbles[0].createdAt),
        updatedAt: new Date(contentBubbles[contentBubbles.length - 1].createdAt),
        messageCount: contentBubbles.length,
        preview,
      });
    }

    // Sort by updatedAt descending (most recent first)
    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Limit to maxCount
    return results.slice(0, maxCount);
  } catch (error) {
    console.error("Error listing conversations:", error);
    return [];
  }
}

/**
 * Get the most recent conversation
 */
export function getMostRecentConversation(
  includeTools: boolean = false
): Conversation | null {
  const summaries = listConversations(1);
  if (summaries.length === 0) {
    return null;
  }
  return loadConversation(summaries[0].id, includeTools);
}
