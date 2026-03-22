<script setup lang="ts">
import type { VoicebotStatus } from '@/shared/types/voicebot.types';

defineProps<{ text: string; status: VoicebotStatus }>();
</script>

<template>
  <div
    v-if="status === 'listening' || status === 'transcribing'"
    class="transcript"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="transcript__header">
      <span class="transcript__label">
        {{ status === 'transcribing' ? 'Transcribiendo' : 'Escuchando' }}
      </span>
      <span class="transcript__dots">
        <span /><span /><span />
      </span>
    </div>
    <p v-if="text" class="transcript__text">{{ text }}</p>
    <p v-else class="transcript__placeholder">Di algo…</p>
  </div>
</template>

<style scoped>
.transcript {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transcript__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transcript__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.transcript__dots {
  display: flex;
  gap: 3px;
  align-items: center;
}

.transcript__dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-success);
  animation: bounce 1.2s ease-in-out infinite;
}

.transcript__dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.transcript__dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.transcript__text {
  font-style: italic;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text);
}

.transcript__placeholder {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-style: italic;
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-5px); opacity: 1; }
}
</style>
