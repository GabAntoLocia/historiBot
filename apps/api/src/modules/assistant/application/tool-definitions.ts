import type { ToolDefinition } from '../domain/llm.port.js';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'search_historical_event',
    description:
      'Busca información verificada sobre un evento, personaje o período histórico en Wikipedia.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Término de búsqueda en inglés (ej: "French Revolution", "Napoleon Bonaparte")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_historical_events',
    description:
      'Devuelve eventos históricos reales que ocurrieron en una fecha, por defecto hoy. Úsala cuando el usuario pregunte qué pasó en un día determinado.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description:
            'Fecha en formato MM-DD (ej: "03-20"). Omitir para usar la fecha de hoy.',
        },
      },
      required: [],
    },
  },
  {
    name: 'register_favorite_event',
    description:
      'Registra un evento histórico como favorito del usuario. Úsala cuando el usuario muestre especial interés en un evento, pida más detalles reiteradas veces, o diga que quiere guardarlo.',
    parameters: {
      type: 'object',
      properties: {
        eventTitle: {
          type: 'string',
          description: 'Nombre o título del evento histórico que el usuario quiere registrar (ej: "Battle of Waterloo", "French Revolution")',
        },
        userComment: {
          type: 'string',
          description: 'Breve resumen de lo que el usuario preguntó o por qué le interesó el evento',
        },
      },
      required: ['eventTitle', 'userComment'],
    },
  },
];
