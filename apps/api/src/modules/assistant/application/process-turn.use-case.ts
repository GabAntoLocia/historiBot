import type { AssistantTurnRequest, AssistantTurnResponse, ToolName } from '@historibot/shared';
import { buildSystemPrompt } from './build-system-prompt.js';
import { TOOL_DEFINITIONS } from './tool-definitions.js';
import { executeToolCall } from '../infrastructure/tools/tool-executor.js';
import { groqAdapter } from '../infrastructure/groq.adapter.js';
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
      // For register_favorite_event, include the eventTitle used by the LLM
      // so the frontend can identify and mark the correct message bubble.
      const enrichedData =
        name === 'register_favorite_event' && typeof args.eventTitle === 'string'
          ? { ...(typeof data === 'object' && data !== null ? (data as object) : {}), savedEventTitle: args.eventTitle }
          : data;
      toolCall = { tool: name, success: true, data: enrichedData };
      return data;
    } catch {
      toolCall = { tool: name, success: false };
      // Comunicamos el fallo a Gemini para que no invente datos
      return { error: 'Tool failed. Do not invent information, acknowledge the limitation.' };
    }
  };

  const result = await groqAdapter.generate({
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
