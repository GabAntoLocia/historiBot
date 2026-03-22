<script setup lang="ts">
import { computed } from 'vue';
import type { VoicebotStatus } from '@/shared/types/voicebot.types';

const props = defineProps<{
  status: VoicebotStatus;
  isListening: boolean;
  isSupported: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();

const label = computed(() => {
  if (!props.isSupported) return 'No soportado';
  if (props.isListening) return 'Detener';
  if (props.status === 'transcribing') return 'Transcribiendo…';
  if (props.status === 'thinking') return 'Pensando…';
  if (props.status === 'speaking') return 'Reproduciendo…';
  return 'Hablar';
});

const isDisabled = computed(
  () =>
    !props.isSupported ||
    props.status === 'transcribing' ||
    props.status === 'thinking' ||
    props.status === 'speaking',
);
</script>

<template>
  <button
    class="speak-button"
    :class="{ active: isListening, disabled: isDisabled }"
    :disabled="isDisabled"
    :aria-label="label"
    @click="emit('toggle')"
  >
    <span class="speak-button__icon" aria-hidden="true">
      {{ isListening ? '⏹' : '🎙' }}
    </span>
    <span class="speak-button__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.speak-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: var(--radius-lg);
  background-color: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    background-color var(--transition),
    transform var(--transition),
    opacity var(--transition);
  box-shadow: var(--shadow-md);
}

.speak-button:hover:not(.disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
}

.speak-button:active:not(.disabled) {
  transform: translateY(0);
}

.speak-button.active {
  background-color: var(--color-error);
  animation: pulse 1.5s ease-in-out infinite;
}

.speak-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.speak-button__icon {
  font-size: 1.15rem;
  line-height: 1;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(239, 68, 68, 0);
  }
}
</style>
