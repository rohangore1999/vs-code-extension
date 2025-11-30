/**
 * Type definitions for Cursor chat data structures
 */

export interface Bubble {
  id: string;
  conversationId: string;
  type: 'user' | 'ai' | 'tool';
  text: string;
  createdAt: number;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
}

export interface Conversation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  bubbles: Bubble[];
  userMessageCount: number;
  aiMessageCount: number;
}

export interface ExportOptions {
  format: 'llm' | 'markdown' | 'jsonl';
  includeTools: boolean;
  outputPath: string;
}

export interface ConversationSummary {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  preview: string;
}

export type ExportFormat = 'llm' | 'markdown' | 'jsonl';

// Raw data from SQLite database
export interface RawBubbleData {
  key: string;
  value: string;
}

export interface RawComposerData {
  key: string;
  value: string;
}

// Parsed bubble structure from JSON
export interface ParsedBubble {
  bubbleId: string;
  type: number; // 1 = user, 2 = ai
  text?: string | null;
  createdAt: number;
  richText?: string;
  codeBlocks?: unknown[];
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
  [key: string]: unknown;
}

// Parsed composer data structure
export interface ParsedComposerData {
  composerId: string;
  bubbles?: string[];
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

