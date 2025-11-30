/**
 * Exporter factory and exports
 */

import { BaseExporter } from './base';
import { LLMExporter } from './llm';
import { MarkdownExporter } from './markdown';
import { JSONLExporter } from './jsonl';
import { ExportFormat } from '../parser/types';

export { BaseExporter } from './base';
export { LLMExporter } from './llm';
export { MarkdownExporter } from './markdown';
export { JSONLExporter } from './jsonl';

/**
 * Get exporter for the specified format
 */
export function getExporter(format: ExportFormat): BaseExporter {
  switch (format) {
    case 'llm':
      return new LLMExporter();
    case 'markdown':
      return new MarkdownExporter();
    case 'jsonl':
      return new JSONLExporter();
    default:
      return new LLMExporter();
  }
}

/**
 * Get all available exporters
 */
export function getAllExporters(): BaseExporter[] {
  return [new LLMExporter(), new MarkdownExporter(), new JSONLExporter()];
}

