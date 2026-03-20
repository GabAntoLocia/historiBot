import type { ToolName } from '@historibot/shared';
import { searchHistoricalEvent } from './search-historical-event.tool.js';
import { registerFavoriteEvent } from './register-favorite-event.tool.js';
import { getHistoricalEvents } from './get-historical-events.tool.js';

// Router de tools: recibe el nombre que Gemini eligió y delega a la implementación.
export const executeToolCall = async (
  name: ToolName,
  args: Record<string, unknown>,
): Promise<unknown> => {
  switch (name) {
    case 'search_historical_event':
      return searchHistoricalEvent(args.query as string);

    case 'get_historical_events':
      return getHistoricalEvents(args.date as string | undefined);

    case 'register_favorite_event':
      return registerFavoriteEvent(args);

    default:
      // TypeScript debería hacer esto imposible gracias al tipo ToolName
      throw new Error(`Unknown tool: ${name}`);
  }
};
