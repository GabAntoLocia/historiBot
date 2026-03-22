import Groq from 'groq-sdk';
import type {
  LLMPort,
  LLMGenerateParams,
  LLMGenerateResult,
  ToolDefinition,
} from '../domain/llm.port.js';
import type { ToolName } from '@historibot/shared';
import { env } from '../../../config/env.js';

// Convierte nuestra definición de dominio al formato de tool de Groq (OpenAI-compatible).
const toGroqTool = (tool: ToolDefinition): Groq.Chat.Completions.ChatCompletionTool => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(tool.parameters.properties).map(([key, val]) => [
          key,
          { type: val.type, description: val.description },
        ]),
      ),
      required: tool.parameters.required ?? [],
    },
  },
});

const createGroqAdapter = (apiKey: string): LLMPort => ({
  async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set. Add it to apps/api/.env');
    }

    const client = new Groq({ apiKey });

    // Construir historial en formato OpenAI
    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: params.systemPrompt },
      ...params.history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: params.message },
    ];

    // Primer turno
    const firstResponse = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: params.tools.map(toGroqTool),
      tool_choice: 'auto',
    });

    const firstMessage = firstResponse.choices[0].message;

    // Sin tool call → respuesta directa
    if (!firstMessage.tool_calls || firstMessage.tool_calls.length === 0) {
      return { text: firstMessage.content ?? '', toolCallUsed: null };
    }

    // El modelo pidió una tool — ejecutarla
    const call = firstMessage.tool_calls[0];
    const toolName = call.function.name as ToolName;
    const toolArgs = JSON.parse(call.function.arguments) as Record<string, unknown>;

    const toolResult = await params.onToolCall(toolName, toolArgs);

    // Segundo turno: enviamos el resultado de la tool
    const toolResultContent = JSON.stringify(toolResult);

    // When the tool returns events from the history API, force Spanish translation
    // by appending an explicit instruction right before the final generation.
    const secondMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      ...messages,
      firstMessage,
      { role: 'tool', tool_call_id: call.id, content: toolResultContent },
    ];

    if (toolName === 'get_historical_events') {
      secondMessages.push({
        role: 'user',
        content:
          'Traduce cada evento al español y responde SOLO con los eventos traducidos separados por |||. Sin introducción ni conclusión.',
      });
    }

    const secondResponse = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: secondMessages,
      tools: params.tools.map(toGroqTool),
    });

    return {
      text: secondResponse.choices[0].message.content || 'Evento registrado como favorito.',
      toolCallUsed: toolName,
    };
  },
});

export const groqAdapter = createGroqAdapter(env.GROQ_API_KEY ?? '');
