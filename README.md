# HistoriBot — Voicebot Web

Prueba técnica: voicebot interactivo con reconocimiento de voz, síntesis de voz e integración con Gemini.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Vue 3 + Vite + Pinia + TypeScript |
| Backend | Fastify + TypeScript |
| IA | Google Gemini (function calling) |
| Voz | Web Speech API (STT) + SpeechSynthesis (TTS) |
| Validación | Zod |
| Monorepo | pnpm workspaces |

## Estructura

```
apps/web       → Frontend Vue 3
apps/api       → Backend Fastify
packages/shared → Schemas Zod y tipos compartidos
```

## Setup

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example apps/api/.env

# Desarrollo (ambos en paralelo)
pnpm dev

# Solo backend
pnpm dev:api

# Solo frontend
pnpm dev:web
```

## Puertos

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health check**: http://localhost:3001/health
