import { ref, onUnmounted } from 'vue';

export function useSpeechSynthesis() {
  const isSpeaking = ref(false);
  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  let currentUtterance: SpeechSynthesisUtterance | null = null;

  function speak(
    text: string,
    onEnd?: () => void,
    onError?: (message: string) => void,
  ): void {
    if (!isSupported) {
      onError?.('Tu navegador no soporta síntesis de voz.');
      return;
    }

    // Cancel any in-progress speech before starting a new one
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      isSpeaking.value = true;
    };

    utterance.onend = () => {
      isSpeaking.value = false;
      currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (event) => {
      isSpeaking.value = false;
      currentUtterance = null;
      // 'interrupted' is expected on deliberate stop() — not an error
      if (event.error !== 'interrupted') {
        onError?.(`Error de síntesis: ${event.error}`);
      }
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stop(): void {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    isSpeaking.value = false;
    currentUtterance = null;
  }

  onUnmounted(() => {
    stop();
  });

  return { isSpeaking, isSupported, speak, stop };
}
