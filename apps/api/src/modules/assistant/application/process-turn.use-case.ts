import type { AssistantTurnRequest, AssistantTurnResponse, ToolName } from '@historibot/shared';
import { buildSystemPrompt } from './build-system-prompt.js';
import { TOOL_DEFINITIONS } from './tool-definitions.js';
import { executeToolCall } from '../infrastructure/tools/tool-executor.js';
import { geminiAdapter } from '../infrastructure/gemini.adapter.js';
import type { ToolCallResult } from '@historibot/shared';

export const processAssistantTurn = async (
  input: AssistantTurnRequest,
): Promise<AssistantTurnResponse> => {
  let toolCall: ToolCallResult | null = null;

  // Callback que el adapter invoca si Gemini decide usar una tool.
  // Capturamos aquí el resultado para incluirlo en la respuesta al frontend.
  const onToolCall = async (
    name: ToolName,
    args: Record<string, unknown>,
  ): Promise<unknown> => {
    try {
      const data = await executeToolCall(name, args);
      toolCall = { tool: name, success: true, data };
      return data;
    } catch {
      toolCall = { tool: name, success: false };
      // Comunicamos el fallo a Gemini para que no invente datos
      return { error: 'Tool failed. Do not invent information, acknowledge the limitation.' };
    }
  };

  const result = await geminiAdapter.generate({
    systemPrompt: buildSystemPrompt(),
    message: input.message,
    history: input.history,
    tools: TOOL_DEFINITIONS,
    onToolCall,
  });

  return {
    reply: result.text,
    toolCall,
  };
};
