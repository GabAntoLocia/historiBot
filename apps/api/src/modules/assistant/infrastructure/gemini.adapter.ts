import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { FunctionDeclaration, Schema } from '@google/generative-ai';
import type { LLMPort, LLMGenerateParams, LLMGenerateResult, ToolDefinition } from '../domain/llm.port.js';
import type { ToolName } from '@historibot/shared';
import { env } from '../../../config/env.js';

// Traduce nuestro tipo de dominio al formato específico del SDK de Gemini.
// El dominio no conoce SchemaType — esa es responsabilidad del adapter.
const toFunctionDeclaration = (tool: ToolDefinition): FunctionDeclaration => ({
  name: tool.name,
  description: tool.description,
  parameters: {
    type: SchemaType.OBJECT,
    properties: Object.fromEntries(
      Object.entries(tool.parameters.properties).map(([key, val]) => [
        key,
        // Usamos `as Schema` porque es la frontera del adapter: 
        // nuestros tipos de dominio son incompatibles con la unión discriminada del SDK.
        { type: SchemaType.STRING, description: val.description } as Schema,
      ]),
    ),
    required: tool.parameters.required,
  },
});

const createGeminiAdapter = (apiKey: string): LLMPort => ({
  async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Add it to apps/api/.env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction: params.systemPrompt,
      tools: [
        {
          functionDeclarations: params.tools.map(toFunctionDeclaration),
        },
      ],
    });

    // Convertir historial al formato Content[] de Gemini
    const chatHistory = params.history.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });

    // Primer turno
    const firstResult = await chat.sendMessage(params.message);
    const firstResponse = firstResult.response;
    const functionCalls = firstResponse.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      return { text: firstResponse.text(), toolCallUsed: null };
    }

    // Gemini pidió una tool — ejecutamos y devolvemos el resultado
    const call = functionCalls[0];
    const toolResult = await params.onToolCall(
      call.name as ToolName,
      call.args as Record<string, unknown>,
    );

    // Enviamos la respuesta de la tool para que Gemini genere el texto final
    const secondResult = await chat.sendMessage([
      {
        functionResponse: {
          name: call.name,
          response: { output: toolResult },
        },
      },
    ]);

    return {
      text: secondResult.response.text(),
      toolCallUsed: call.name as ToolName,
    };
  },
});

// Singleton: el adapter se crea una vez con la API key del entorno
export const geminiAdapter = createGeminiAdapter(env.GEMINI_API_KEY ?? '');
