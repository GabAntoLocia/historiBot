import { ref, onUnmounted } from 'vue';

/**
 * Reads raw microphone amplitude using Web Audio API + its own getUserMedia stream.
 * Runs independently from SpeechRecognition — Chrome allows both simultaneously.
 */
export function useAudioLevel() {
  const level = ref(0);
  const isActive = ref(false);

  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let stream: MediaStream | null = null;
  let rafId: number | null = null;

  function tick(): void {
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);

    let sumSq = 0;
    for (let i = 0; i < data.length; i++) {
      const norm = (data[i] - 128) / 128;
      sumSq += norm * norm;
    }
    const rms = Math.sqrt(sumSq / data.length);
    level.value = Math.min(100, Math.round(rms * 400));

    rafId = requestAnimationFrame(tick);
  }

  async function start(): Promise<void> {
    if (isActive.value) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx = new AudioContext();
      // Brave/Chrome may create the context in 'suspended' state
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      isActive.value = true;
      tick();
    } catch {
      // Fail silently — meter just won't show levels
    }
  }

  function stop(): void {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    source?.disconnect();
    audioCtx?.close();
    stream?.getTracks().forEach((t) => t.stop());
    source = null; analyser = null; audioCtx = null; stream = null;
    level.value = 0;
    isActive.value = false;
  }

  onUnmounted(stop);

  return { level, isActive, start, stop };
}

