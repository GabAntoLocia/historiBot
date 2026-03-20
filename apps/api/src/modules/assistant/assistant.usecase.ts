// Re-exporta el caso de uso real desde la capa de aplicación.
// El handler no necesita saber dónde vive la implementación.
export { processAssistantTurn } from './application/process-turn.use-case.js';

