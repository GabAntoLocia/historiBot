import { ref, onUnmounted } from 'vue';
import type { SpeechRecognitionInstance } from '@/shared/types/speech.types';
import '@/shared/types/speech.types';

export interface SpeechRecognitionCallbacks {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
}

// Errors that should be shown to the user
const RECOGNITION_ERRORS: Record<string, string> = {
  'network': 'Voz no disponible (Brave bloquea Google STT). Usa Chrome o Edge.',
  'not-allowed': 'Permiso de microfono denegado. Activalo en la configuracion del navegador.',
  'audio-capture': 'No se encontro microfono. Comprueba que esta conectado y permitido.',
};
// Errors that end the session silently without showing a message
const SILENT_ERRORS = new Set(['no-speech', 'aborted']);

export function useSpeechRecognition() {
  const isListening = ref(false);
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  let recognition: SpeechRecognitionInstance | null = null;
  let currentCallbacks: SpeechRecognitionCallbacks | null = null;
  // Prevent double-stop when we call stop() after onFinal
  let stopping = false;

  function buildInstance(): SpeechRecognitionInstance {
    const Ctor = (window.SpeechRecognition ?? window.webkitSpeechRecognition)!;
    const rec = new Ctor();
    rec.lang = 'es-ES';
    // continuous: true keeps the session open until stop() is called.
    // With continuous: false Chrome gives ~5 s to detect voice and fires
    // no-speech, which causes the intermittent failures in Chrome/Edge.
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      if (!currentCallbacks) return;
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) currentCallbacks.onPartial(interim);
      if (final) {
        // Got a complete utterance — stop the session and hand off the text.
        // We stop here so the next call to startListening can reuse this
        // instance cleanly (stop → onend → start on the same instance).
        stopListening();
        currentCallbacks.onFinal(final.trim());
      }
    };

    rec.onerror = (event) => {
      isListening.value = false;
      // Discard the instance after a real error so the next session starts
      // with a clean audio pipeline.
      if (!SILENT_ERRORS.has(event.error)) {
        recognition = null;
      }
      // no-speech with continuous mode means total silence for a long time —
      // just clear state silently instead of alarming the user.
      if (SILENT_ERRORS.has(event.error)) {
        currentCallbacks?.onEnd?.();
        return;
      }
      const msg = RECOGNITION_ERRORS[event.error] ?? `Error de reconocimiento: ${event.error}`;
      currentCallbacks?.onError(msg);
    };

    rec.onstart = () => {
      isListening.value = true;
      stopping = false;
    };

    rec.onend = () => {
      isListening.value = false;
      stopping = false;
      currentCallbacks?.onEnd?.();
    };

    return rec;
  }

  async function startListening(callbacks: SpeechRecognitionCallbacks): Promise<void> {
    if (!isSupported) {
      callbacks.onError('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    const isNewInstance = !recognition;
    if (isNewInstance) {
      recognition = buildInstance();
      // Brief pause for Edge/Chrome to initialise the audio subsystem
      // before start() on a brand-new instance.
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    currentCallbacks = callbacks;
    recognition!.start();
  }

  function stopListening(): void {
    if (stopping || !recognition) return;
    stopping = true;
    recognition.stop();
    isListening.value = false;
  }

  onUnmounted(() => {
    recognition?.abort();
    recognition = null;
    currentCallbacks = null;
  });

  return { isListening, isSupported, startListening, stopListening };
}
