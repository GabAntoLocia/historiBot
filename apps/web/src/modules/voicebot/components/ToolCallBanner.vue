<script setup lang="ts">
import type { ToolCallResult } from '@historibot/shared';

defineProps<{ toolCall: ToolCallResult }>();

const TOOL_LABELS: Record<string, string> = {
  search_historical_event: '🔍 Búsqueda en Wikipedia',
  get_historical_events: '📅 Eventos del día',
  register_favorite_event: '⭐ Evento guardado como favorito',
};
</script>

<template>
  <Transition name="slide">
    <div
      class="tool-banner"
      :class="toolCall.success ? 'tool-banner--ok' : 'tool-banner--fail'"
    >
      <span class="tool-banner__icon">{{ toolCall.success ? '✓' : '✗' }}</span>
      <span class="tool-banner__label">
        {{ TOOL_LABELS[toolCall.tool] ?? toolCall.tool }}
      </span>
      <span v-if="!toolCall.success" class="tool-banner__note">fallido</span>
    </div>
  </Transition>
</template>

<style scoped>
.tool-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-lg);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  width: fit-content;
  margin-top: 4px;
}

.tool-banner--ok {
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
  border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
}

.tool-banner--fail {
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
  color: var(--color-error);
  border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
}

.tool-banner__icon {
  font-style: normal;
}

.tool-banner__note {
  opacity: 0.75;
}

.slide-enter-active {
  transition: all 0.25s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
