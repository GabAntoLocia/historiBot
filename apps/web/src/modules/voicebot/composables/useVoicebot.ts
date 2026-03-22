import { storeToRefs } from 'pinia';
import { useConversationStore } from '../store/conversation.store';
import { useSpeechRecognition } from './useSpeechRecognition';

// useVoicebot is a component-scoped bridge: it wires SpeechRecognition (which
// needs Vue lifecycle hooks for cleanup) to the store. All business logic —
// API calls, message history, speech synthesis — lives in the store.
export function useVoicebot() {
  const store = useConversationStore();
  const {
    messages, status, partialTranscript, finalTranscript,
    lastToolResult, error, hasMessages, selectedMessageId,
  } = storeToRefs(store);

  const speech = useSpeechRecognition();

  // ─── Voice input ──────────────────────────────────────────────────────────

  function startListening(): void {
    // Block if SR is already capturing or API call is in-flight.
    // Allow start during 'speaking' → barge-in: cancel synthesis and listen.
    if (speech.isListening.value || store.status === 'thinking') return;

    store.resetError();
    // Cancel ongoing synthesis before starting SR (barge-in support)
    window.speechSynthesis?.cancel();
    // Set 'listening' immediately so the button gives visual feedback before
    // recognition.onstart fires asynchronously
    store.startListening();

    speech.startListening({
      onPartial: (partial) => {
        store.setStatus('transcribing');
        store.setPartialTranscript(partial);
      },
      onFinal: (final) => {
        store.setPartialTranscript('');
        store.submitTranscript(final);
      },
      onError: (errorMsg) => store.setError(errorMsg),
      onEnd: () => {
        // SR session ended without a final result (timeout or manual stop).
        // Don't override states set by submitTranscript.
        if (store.status !== 'thinking' && store.status !== 'speaking') {
          store.stopListening();
        }
      },
    });
  }

  function stopListening(): void {
    speech.stopListening();
    store.stopListening();
  }

  function toggleListening(): void {
    if (speech.isListening.value) {
      stopListening();
    } else {
      startListening();
    }
  }

  // ─── Text fallback ────────────────────────────────────────────────────────

  async function sendTextMessage(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || store.isActive) return;
    store.resetError();
    await store.submitTranscript(trimmed);
  }

  return {
    // Reactive state from store
    messages,
    status,
    partialTranscript,
    finalTranscript,
    lastToolResult,
    error,
    hasMessages,
    selectedMessageId,
    // Speech recognition state (component-scoped)
    isListening: speech.isListening,
    isVoiceSupported: speech.isSupported,
    // Actions
    toggleListening,
    sendTextMessage,
    selectMessage: store.selectMessage,
    clearError: store.resetError,
    reset: store.reset,
  };
}
