import type { Message, ToolName } from '@historibot/shared';

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParameter>;
  required?: string[];
}

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parameters: ToolParameters;
}

export interface LLMGenerateParams {
  systemPrompt: string;
  message: string;
  history: Message[];
  tools: ToolDefinition[];
  // Callback que el use case provee para ejecutar la tool solicitada
  onToolCall: (name: ToolName, args: Record<string, unknown>) => Promise<unknown>;
}

export interface LLMGenerateResult {
  text: string;
  toolCallUsed: ToolName | null;
}

export interface LLMPort {
  generate(params: LLMGenerateParams): Promise<LLMGenerateResult>;
}
