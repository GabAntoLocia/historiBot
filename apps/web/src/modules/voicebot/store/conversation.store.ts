import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LocalMessage, VoicebotStatus } from '@/shared/types/voicebot.types';
import type { Message, ToolCallResult } from '@historibot/shared';
import { sendTurn } from '../services/api.service';

export const useConversationStore = defineStore('conversation', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const messages = ref<LocalMessage[]>([]);
  const status = ref<VoicebotStatus>('idle');
  const partialTranscript = ref('');
  const finalTranscript = ref('');
  const lastToolResult = ref<ToolCallResult | null>(null);
  const error = ref<string | null>(null);
  const selectedMessageId = ref<string | null>(null);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const hasMessages = computed(() => messages.value.length > 0);
  const isActive = computed(
    () => status.value !== 'idle' && status.value !== 'error',
  );
  const history = computed<Message[]>(() =>
    messages.value.map(({ role, content }) => ({ role, content })),
  );

  // ─── Primitive setters ────────────────────────────────────────────────────
  function setStatus(s: VoicebotStatus): void { status.value = s; }
  function setPartialTranscript(text: string): void { partialTranscript.value = text; }

  function setError(message: string): void {
    error.value = message;
    status.value = 'error';
  }

  function resetError(): void {
    error.value = null;
    if (status.value === 'error') status.value = 'idle';
  }

  // ─── Message actions ──────────────────────────────────────────────────────
  function addUserMessage(content: string): LocalMessage {
    const msg: LocalMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    messages.value.push(msg);
    return msg;
  }

  function addAssistantMessage(content: string): LocalMessage {
    const msg: LocalMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };
    messages.value.push(msg);
    return msg;
  }

  // ─── Speech synthesis ─────────────────────────────────────────────────────
  // Lives in the store because it manages status transitions and requires no
  // Vue component lifecycle hooks — window.speechSynthesis is a browser global.
  function speakAssistantReply(text: string): void {
    if (!('speechSynthesis' in window)) {
      setStatus('idle');
      return;
    }
    window.speechSynthesis.cancel(); // clear any queued utterances
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.onend = () => setStatus('idle');
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (e.error === 'interrupted') {
        setStatus('idle');
      } else {
        setError(`Error al reproducir respuesta: ${e.error}`);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  // ─── Core flow: transcript ➜ API ➜ reply ─────────────────────────────────
  // submitTranscript owns the full turn: validates, calls the API service,
  // persists messages, and hands the reply to speakAssistantReply.
  // No fetch lives in composables or views.
  async function submitTranscript(transcript: string): Promise<void> {
    if (!transcript.trim()) return;

    const previousHistory = [...history.value];
    finalTranscript.value = transcript;
    addUserMessage(transcript);
    setPartialTranscript('');
    setStatus('thinking');

    try {
      const response = await sendTurn({ message: transcript, history: previousHistory });
      lastToolResult.value = response.toolCall;

      // Mark the correct assistant bubble as favorite using savedEventTitle for fuzzy match
      if (response.toolCall?.tool === 'register_favorite_event' && response.toolCall?.success) {
        const savedTitle = (response.toolCall.data as Record<string, unknown> | undefined)?.savedEventTitle as string | undefined;
        let targetMsg: LocalMessage | undefined;
        if (savedTitle) {
          const keywords = savedTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          targetMsg = [...messages.value].reverse().find(
            m => m.role === 'assistant' && keywords.some(kw => m.content.toLowerCase().includes(kw))
          );
        }
        if (!targetMsg) {
          targetMsg = [...messages.value].reverse().find(m => m.role === 'assistant');
        }
        if (targetMsg) targetMsg.savedAsFavorite = true;
        selectedMessageId.value = null;
      }

      // Split multi-event replies into individual bubbles
      const parts = response.reply
        .split('|||')
        .map(s => s.trim())
        .filter(Boolean);

      for (const part of parts) addAssistantMessage(part);
      speakAssistantReply(parts.join('. '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  // ─── startListening / stopListening live here as thin status guards.
  // The actual SpeechRecognition wiring (onUnmounted cleanup) is in
  // useVoicebot, which runs inside component setup where lifecycle hooks work.
  function startListening(): void { setStatus('listening'); }
  function stopListening(): void {
    window.speechSynthesis?.cancel();
    setPartialTranscript('');
    if (status.value !== 'thinking' && status.value !== 'speaking') {
      setStatus('idle');
    }
  }

  function reset(): void {
    window.speechSynthesis?.cancel();
    messages.value = [];
    status.value = 'idle';
    partialTranscript.value = '';
    finalTranscript.value = '';
    lastToolResult.value = null;
    error.value = null;
    selectedMessageId.value = null;
  }

  function selectMessage(id: string | null): void {
    selectedMessageId.value = selectedMessageId.value === id ? null : id;
  }

  return {
    // State
    messages,
    status,
    partialTranscript,
    finalTranscript,
    lastToolResult,
    error,
    selectedMessageId,
    // Computed
    hasMessages,
    isActive,
    history,
    // Setters
    setStatus,
    setPartialTranscript,
    setError,
    resetError,
    // Message actions
    addUserMessage,
    addAssistantMessage,
    // Flow actions
    startListening,
    stopListening,
    submitTranscript,
    speakAssistantReply,
    selectMessage,
    reset,
  };
});
