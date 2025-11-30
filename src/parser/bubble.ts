/**
 * Parse bubble data from raw JSON
 */

import { Bubble, ParsedBubble, RawBubbleData } from "./types";

/**
 * Tool name mappings for display
 */
const TOOL_NAMES: Record<string, string> = {
  read_file: "Read File",
  codebase_search: "Codebase Search",
  grep_search: "Grep Search",
  file_search: "File Search",
  list_dir: "List Directory",
  run_terminal_cmd: "Terminal Command",
  edit_file: "Edit File",
  write_to_file: "Write File",
  search_replace: "Search & Replace",
};

/**
 * Parse createdAt which can be a number (milliseconds), string (ISO), or undefined
 */
function parseCreatedAt(createdAt: unknown): number {
  if (!createdAt) {
    return 0;
  }
  
  if (typeof createdAt === "number") {
    return createdAt;
  }
  
  if (typeof createdAt === "string") {
    // Try parsing as ISO date string
    const parsed = Date.parse(createdAt);
    if (!isNaN(parsed)) {
      return parsed;
    }
    // Try parsing as number string
    const num = parseInt(createdAt, 10);
    if (!isNaN(num)) {
      return num;
    }
  }
  
  return 0;
}

/**
 * Parse a single bubble from raw database data
 */
export function parseBubble(raw: RawBubbleData): Bubble | null {
  try {
    // Key format: bubbleId:conversationId:bubbleId
    const keyParts = raw.key.split(":");
    if (keyParts.length < 3) {
      return null;
    }

    const conversationId = keyParts[1];
    const bubbleId = keyParts[2];

    // Skip if value is null, empty, or undefined
    if (!raw.value || raw.value === "null" || raw.value === "undefined") {
      return null;
    }

    // Parse JSON value
    let parsed: ParsedBubble;
    try {
      parsed = JSON.parse(raw.value);
    } catch {
      return null;
    }

    // Skip if parsed is null, undefined, or not an object
    if (parsed === null || parsed === undefined || typeof parsed !== "object") {
      return null;
    }

    // Determine bubble type
    // Type 1 = user, Type 2 = AI
    let type: "user" | "ai" | "tool" = "ai";
    if (parsed.type === 1) {
      type = "user";
    } else if (parsed.toolName || parsed.toolFormerData) {
      type = "tool";
    }

    // Get text content
    let text = "";
    if (parsed.text) {
      text = String(parsed.text);
    } else if (parsed.richText) {
      text = String(parsed.richText);
    }

    // Parse createdAt timestamp
    const createdAt = parseCreatedAt(parsed.createdAt);

    // Build bubble object
    const bubble: Bubble = {
      id: bubbleId,
      conversationId,
      type,
      text: text || "",
      createdAt,
    };

    // Add tool information if present
    if (parsed.toolName) {
      bubble.toolName = TOOL_NAMES[parsed.toolName] || parsed.toolName;
      bubble.toolArgs = parsed.toolArgs;
      bubble.toolResult = parsed.toolResult;
    } else if (parsed.toolFormerData) {
      bubble.toolName = "Tool Call";
      bubble.type = "tool";
    }

    return bubble;
  } catch (error) {
    // Silently ignore parse errors - they're expected for some data
    return null;
  }
}

/**
 * Parse multiple bubbles and sort by creation time
 */
export function parseBubbles(rawBubbles: RawBubbleData[]): Bubble[] {
  const bubbles: Bubble[] = [];

  for (const raw of rawBubbles) {
    const bubble = parseBubble(raw);
    if (bubble) {
      bubbles.push(bubble);
    }
  }

  // Sort by createdAt timestamp (NOT by UUID!)
  // Put 0-timestamp items at the end
  bubbles.sort((a, b) => {
    if (a.createdAt === 0 && b.createdAt === 0) return 0;
    if (a.createdAt === 0) return 1;
    if (b.createdAt === 0) return -1;
    return a.createdAt - b.createdAt;
  });

  return bubbles;
}

/**
 * Filter bubbles to only include user and AI messages with text
 */
export function filterContentBubbles(
  bubbles: Bubble[],
  includeTools: boolean
): Bubble[] {
  return bubbles.filter((bubble) => {
    // Always filter out empty text bubbles
    if (!bubble.text || bubble.text.trim() === "") {
      // But keep tool calls if requested
      if (bubble.type === "tool" && includeTools) {
        return true;
      }
      return false;
    }

    // Include user and AI messages
    if (bubble.type === "user" || bubble.type === "ai") {
      return true;
    }

    // Include tools if requested
    if (bubble.type === "tool" && includeTools) {
      return true;
    }

    return false;
  });
}
