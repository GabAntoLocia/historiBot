<script setup lang="ts">
import { computed } from 'vue';
import type { VoicebotStatus } from '@/shared/types/voicebot.types';

const props = defineProps<{ status: VoicebotStatus }>();

interface StatusConfig {
  label: string;
  modifier: string;
}

const config = computed<StatusConfig>(() => {
  const map: Record<VoicebotStatus, StatusConfig> = {
    idle:         { label: 'Listo',          modifier: 'idle' },
    listening:    { label: 'Escuchando',     modifier: 'listening' },
    transcribing: { label: 'Transcribiendo', modifier: 'transcribing' },
    thinking:     { label: 'Pensando',       modifier: 'thinking' },
    speaking:     { label: 'Respondiendo',   modifier: 'speaking' },
    error:        { label: 'Error',          modifier: 'error' },
  };
  return map[props.status];
});
</script>

<template>
  <div
    class="status"
    :class="`status--${config.modifier}`"
    role="status"
    :aria-label="config.label"
  >
    <span class="status__dot" />
    <span class="status__label">{{ config.label }}</span>
  </div>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted);
  user-select: none;
}

.status__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: currentColor;
}

/* idle */
.status--idle .status__dot   { background-color: var(--color-text-muted); }
.status--idle .status__label { color: var(--color-text-muted); }

/* listening */
.status--listening .status__dot   { background-color: var(--color-success); animation: blink 1s infinite; }
.status--listening .status__label { color: var(--color-success); }

/* transcribing */
.status--transcribing .status__dot   { background-color: var(--color-warning); animation: blink 0.8s infinite; }
.status--transcribing .status__label { color: var(--color-warning); }

/* thinking */
.status--thinking .status__dot   { background-color: #60a5fa; animation: blink 0.5s infinite; }
.status--thinking .status__label { color: #60a5fa; }

/* speaking */
.status--speaking .status__dot   { background-color: var(--color-primary-hover); animation: blink 1.2s infinite; }
.status--speaking .status__label { color: var(--color-primary-hover); }

/* error */
.status--error .status__dot   { background-color: var(--color-error); }
.status--error .status__label { color: var(--color-error); }

@keyframes blink {
  0%,
  100% { opacity: 1; }
  50%  { opacity: 0.25; }
}
</style>
