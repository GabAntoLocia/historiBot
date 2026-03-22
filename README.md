# HistoriBot

Asistente conversacional especializado en historia universal con interfaz de voz. Pregúntale qué pasó en un día, busca eventos históricos y guarda tus favoritos — todo por voz o texto.

Proyecto de prueba técnica. TypeScript estricto, arquitectura de monorepo, sin frameworks de UI más allá de Vue 3.

---

## ✅ Requerimientos

| Requerimiento | Estado |
|---|---|
| Entrada de voz — Web Speech API | ✅ |
| Salida de voz — Web Speech Synthesis | ✅ |
| LLM conversacional con historial de contexto | ✅ |
| Tool: buscar evento histórico (Day in History API) | ✅ |
| Tool: obtener eventos por fecha (Day in History API) | ✅ |
| Tool: registrar evento favorito (webhook POST) | ✅ |
| Eventos listados como burbujas individuales | ✅ |
| Eventos favoritos marcados visualmente | ✅ |
| Seleccionar mensaje por clic para guardar | ✅ |
| Botón ⭐ en la barra de controles | ✅ |
| Indicador de tool call activa (ToolCallBanner) | ✅ |
| Input de texto como fallback | ✅ |
| Manejo de errores con banner visible | ✅ |
| Tipos y schemas compartidos entre frontend y backend | ✅ |
| TypeScript estricto: 0 errores (ambas apps) | ✅ |

---

## Flujo de demo

```
Usuario: "¿Qué pasó el 20 de marzo?"
  → Bot llama get_historical_events(03-20)
  → Devuelve 5 eventos, cada uno en su propia burbuja de chat

Usuario: [hace clic en una burbuja para seleccionarla]
  → La burbuja se resalta en morado

Usuario: [presiona ⭐]
  → Bot llama register_favorite_event con el texto completo
  → Se dispara POST al webhook
  → La burbuja queda marcada con ⭐ Guardado en dorado
  → Al pedir al bot por voz que guarde un evento en particular lo guarda y marca como favorito

Usuario: "Cuéntame más sobre el ataque al metro de Tokio"
  → Bot llama search_historical_event("Tokyo subway attack Aum Shinrikyo")
  → Devuelve resumen de Wikipedia
  → Bot responde en 1-2 oraciones leídas en voz alta
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Vue 3 · Vite 6 · Pinia 2 · TypeScript 5.5 |
| Backend | Fastify 5 · Node.js ≥18 · TypeScript 5.5 |
| LLM | Groq (`llama-3.3-70b-versatile`) via `groq-sdk` |
| Entrada de voz | Web Speech API (`SpeechRecognition`) |
| Salida de voz | Web Speech Synthesis (`SpeechSynthesisUtterance`) |
| Validación | Zod (schemas compartidos) |
| Gestor de paquetes | pnpm 8 + workspaces |
| Eventos históricos | Day in History API · API Ninjas (fallback) · Wikipedia REST |
| Webhook favoritos | Configurable (por defecto: httpbin.org/post) |

---

## Arquitectura del monorepo

```
historyBot/
├── apps/
│   ├── api/          # API REST Fastify (puerto 3001)
│   └── web/          # SPA Vue 3 (puerto 5173)
└── packages/
    └── shared/       # Schemas Zod + tipos TypeScript compartidos
```

`@historibot/shared` es importado por `api` y `web` vía workspace protocol de pnpm. Garantiza que el contrato de request/response siempre esté sincronizado sin duplicación.

---

## Estructura de carpetas

```
apps/api/src/
├── config/
│   └── env.ts                     # Variables de entorno validadas con Zod
├── lib/
│   └── http-client.ts             # Wrapper de fetch tipado con HttpError
├── app/
│   ├── server.ts                  # Instancia Fastify + registro de plugins
│   ├── plugins/cors.ts            # CORS con soporte multi-origen
│   └── routes/
│       ├── health.ts              # GET /health
│       └── assistant.ts           # POST /assistant/turn
└── modules/assistant/
    ├── domain/                    # Puertos (interfaces): LLM, eventos, registro
    ├── application/
    │   ├── build-system-prompt.ts
    │   ├── process-turn.use-case.ts
    │   └── tool-definitions.ts    # Schemas de tools expuestos al LLM
    └── infrastructure/
        ├── groq.adapter.ts        # Adapter LLM (function calling en dos turnos)
        ├── historical-events.adapter.ts
        ├── registration.adapter.ts
        └── tools/
            ├── get-historical-events.tool.ts
            ├── search-historical-event.tool.ts
            ├── register-favorite-event.tool.ts
            └── tool-executor.ts

apps/web/src/
├── shared/types/
│   └── voicebot.types.ts          # LocalMessage (extiende Message compartido)
└── modules/voicebot/
    ├── store/
    │   └── conversation.store.ts  # Pinia store — toda la lógica de negocio
    ├── composables/
    │   ├── useVoicebot.ts         # Puente SR ↔ store (scoped al componente)
    │   └── useSpeechRecognition.ts
    ├── services/
    │   └── api.service.ts         # sendTurn() — llama al backend
    ├── views/
    │   └── VoicebotView.vue
    └── components/
        ├── MessageList.vue
        ├── MessageBubble.vue      # Clickeable; muestra ⭐ si savedAsFavorite
        ├── SpeakButton.vue
        ├── TextInput.vue
        ├── AudioMeter.vue         # Animación CSS pura (sin getUserMedia)
        ├── ToolCallBanner.vue     # Muestra la tool que está ejecutando
        ├── TranscriptArea.vue
        ├── StatusIndicator.vue
        └── ErrorBanner.vue

packages/shared/src/
└── schemas/chat.ts                # Schemas Zod para Message, ToolCallResult, etc.
```

---

## Variables de entorno

Crear `apps/api/.env` (ver `apps/api/.env.example`):

```env
# Requerido
GROQ_API_KEY=gsk_...          # Obtener en console.groq.com (tier gratuito disponible)

# Opcional — fuentes de datos históricos
DAY_IN_HISTORY_API_KEY=       # dayinhistory.dev — gratis: 10 req/h sin clave
API_NINJAS_KEY=                # api-ninjas.com — fallback si la primaria falla

# Opcional — webhook para registro de favoritos
REGISTER_WEBHOOK_URL=https://httpbin.org/post   # por defecto; usar Pipedream o RequestBin

# Opcional — configuración del servidor
PORT=3001
CORS_ORIGIN=http://localhost:5173   # acepta lista separada por comas o * en producción
```

> `GROQ_API_KEY` es la única clave necesaria para el flujo completo. El resto tiene defaults o fallbacks.

---

## Correr localmente

**Requisitos:** Node.js ≥ 18, pnpm ≥ 8

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear archivo de entorno y agregar GROQ_API_KEY
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env y completar GROQ_API_KEY

# 3. Iniciar ambas apps en paralelo
pnpm dev
```

| App | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| Health check | http://localhost:3001/health |

Comandos individuales:

```bash
pnpm dev:api      # solo API
pnpm dev:web      # solo frontend
pnpm typecheck    # type-check ambas apps
```

---

## Probar la app

1. Abrir http://localhost:5173 en **Microsoft Edge** (recomendado — Chrome bloquea los endpoints de Google STT en algunas redes)
2. Presionar **Hablar** y hablar, o escribir en el input de texto
3. Consultas de ejemplo:
   - *"¿Qué pasó hoy en la historia?"*
   - *"¿Qué pasó el 14 de febrero?"*
   - *"Cuéntame sobre la Revolución Francesa"*
   - *"Guarda el evento del metro de Tokio"*
4. Hacer clic en cualquier burbuja del asistente para seleccionarla (se pone morada), luego presionar ⭐
5. Las burbujas guardadas muestran el badge dorado ⭐ Guardado

---

## Cómo funciona la voz

```
[Usuario presiona Hablar]
  → SpeechRecognition arranca (continuous: true, lang: es-ES)
  → Resultados parciales se muestran en el área de transcript
  → Al obtener resultado final: reconocimiento para, store.submitTranscript() se llama

[API responde]
  → SpeechSynthesisUtterance lee la respuesta en voz alta (lang: es-ES)
  → Barge-in soportado: presionar Hablar durante la reproducción cancela la síntesis y reinicia SR

[Errores de SR]
  → La instancia se descarta y reconstruye en el próximo uso (evita loops de no-speech)
  → AudioMeter es CSS puro — evita conflictos getUserMedia con SpeechRecognition
```

> **Web Speech API en producción:** Solo funciona en HTTPS. Vercel sirve con HTTPS automáticamente. En Chrome puede haber bloqueos de red hacia los endpoints de Google STT; se recomienda Edge o usar el input de texto como fallback.

---

## Cómo funciona el backend

### Único endpoint

```
POST /assistant/turn
Body:      { message: string, history: Message[] }
Respuesta: { reply: string, toolCall: ToolCallResult | null }
```

### Flujo LLM en dos turnos (Groq function calling)

```
Turno 1: system prompt + historial + mensaje de usuario + definiciones de tools
  → Si el LLM elige una tool → se ejecuta server-side → resultado se agrega al hilo

Turno 2: hilo completo + resultado de la tool → respuesta final al usuario
  → Para get_historical_events: se inyecta "traducir al español, usar separador |||"
  → Frontend splitea en ||| → una burbuja por evento
```

### Tools

| Tool | Fuente | Detalle |
|---|---|---|
| `search_historical_event` | Day in History API| Sin API key |
| `get_historical_events` | Day in History API · API Ninjas (fallback) | Devuelve string pre-formateado con `\|\|\|` |
| `register_favorite_event` | Webhook configurable (POST) | Payload: `conversationId`, `eventTitle`, `userComment`, `timestamp`, `source: "historibot"` |

---

## Decisiones técnicas

**Groq en lugar de Gemini** — Gemini 2.0 Flash tenía límite de 0 RPM en tier gratuito. Groq con `llama-3.3-70b-versatile` es gratuito, generoso y compatible con el formato OpenAI de function calling.

**AudioMeter solo CSS** — Cualquier llamada concurrente a `getUserMedia` mientras `SpeechRecognition` está activo dispara errores `no-speech` en Chromium. Se eliminó `getUserMedia` completamente; la animación es puro CSS con keyframes.

**`continuous: true` en SR** — `continuous: false` activa el timeout de ~5 segundos de Chrome. `continuous: true` evita terminaciones prematuras; un resultado final detiene la sesión programáticamente.

**Singleton SR con descarte en error** — Reusar la instancia de `SpeechRecognition` entre turnos es más estable que reconstruirla. En cualquier error la instancia se anula y se reconstruye fresca para evitar estados colgados.

**Output pre-formateado en el tool** — Pedirle al LLM que use `|||` vía system prompt era poco confiable. La solución: el tool devuelve un campo `formatted` pre-armado; el LLM traduce y preserva los separadores en un mensaje de usuario inyectado por el adapter.

**Store como dueño de la lógica** — `conversation.store.ts` posee historial de mensajes, llamadas API, síntesis de voz y transiciones de estado. `useVoicebot.ts` es intencionalmente delgado — solo conecta `SpeechRecognition` (que necesita lifecycle hooks de Vue) con el store.

**Fuzzy match para marcar favorito** — Al completar `register_favorite_event`, el backend devuelve `savedEventTitle`. El store extrae keywords y escanea los mensajes en reversa para marcar la burbuja correcta, con fallback al último mensaje del asistente.

---

## Despliegue

### Frontend → Vercel

Vercel detecta automáticamente el monorepo. El archivo `apps/web/vercel.json` ya está configurado.

**Pasos:**

1. Importar el repositorio en [vercel.com](https://vercel.com)
2. Vercel detectará `apps/web/vercel.json` automáticamente
3. En **Settings → Environment Variables** agregar:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://historibot-api.onrender.com` (URL del backend desplegado) |

4. Deploy → la URL resultante será algo como `https://historibot.vercel.app`

> El `vercel.json` incluye rewrite `/*` → `/index.html` para que Vue Router funcione correctamente como SPA.

---

### Backend → Render

El archivo `apps/api/render.yaml` ya está configurado para Render.

**Pasos:**

1. Ir a [render.com](https://render.com) → **New Web Service** → conectar el repositorio
2. Render detectará `apps/api/render.yaml` automáticamente
3. En el dashboard confirmar o agregar las variables de entorno:

| Variable | Valor |
|---|---|
| `GROQ_API_KEY` | Tu clave de [console.groq.com](https://console.groq.com) |
| `CORS_ORIGIN` | `https://historibot.vercel.app` (URL de Vercel) |
| `REGISTER_WEBHOOK_URL` | URL de tu webhook (Pipedream, RequestBin, etc.) |
| `PORT` | `3001` |

4. Deploy — el primer arranque en el plan free tarda ~30 segundos (cold start)

> **Railway como alternativa:** Crear proyecto → conectar repo → `Root Directory: apps/api` → `Build: pnpm install && pnpm build` → `Start: node dist/index.js`. Railway no tiene cold starts en el plan Hobby ($5/mes).

---

### Conectar frontend con backend

El frontend usa `VITE_API_URL` para determinar a dónde enviar las peticiones:

- **Desarrollo:** La variable no está definida → usa `/api` → Vite lo proxea a `localhost:3001`
- **Producción:** `VITE_API_URL=https://tu-api.onrender.com` → las peticiones van directo al backend desplegado

Ejemplo de flujo de petición en producción:
```
Browser → https://historibot.vercel.app
  POST https://historibot-api.onrender.com/assistant/turn
  ← { reply: "...", toolCall: {...} }
```

---

### Problemas comunes en producción

| Problema | Causa | Solución |
|---|---|---|
| `CORS error` en el browser | `CORS_ORIGIN` no incluye la URL de Vercel | Agregar la URL exacta de Vercel a `CORS_ORIGIN` |
| API responde 503 en la primera petición | Cold start de Render (plan free) | Esperar 30s o usar Railway/Render paid |
| Voz no funciona | La app no está en HTTPS | Vercel siempre sirve HTTPS; verificar que no se acceda por HTTP |
| SR rompe en Chrome | Google STT bloqueado por red/extensiones | Usar Edge o el input de texto |
| `GROQ_API_KEY not set` | Variable no cargada en Render | Verificar en Render → Environment que la clave está activa |
| Build falla en Vercel | pnpm workspace no resuelve shared | Verificar que `pnpm-workspace.yaml` incluye `packages/*` |

---

## Posibles mejoras

- **Favoritos persistentes** — Guardar en `localStorage` o una BD; actualmente se pierden al recargar
- **Turnos multi-tool** — El adapter maneja una sola tool por turno; encadenar tools permitiría consultas más ricas
- **Fallback SR para Chrome** — Transcripción server-side con Whisper/Deepgram cuando la Web Speech API no está disponible
- **Lista virtual** — Conversaciones largas con muchas burbujas se beneficiarían de un scroll virtualizado
- **Panel de favoritos** — Mostrar todos los eventos guardados en la sesión, no solo el último
- **Tests** — Sin tests automatizados aún; Vitest para el store y Supertest para las rutas API serían las primeras adiciones
