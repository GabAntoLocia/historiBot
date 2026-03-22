<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useConversationStore } from '../store/conversation.store';
import type { LocalMessage } from '@/shared/types/voicebot.types';

const props = defineProps<{ message: LocalMessage }>();

const store = useConversationStore();
const { selectedMessageId } = storeToRefs(store);

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function handleClick(): void {
  if (props.message.role === 'assistant' && !props.message.savedAsFavorite) {
    store.selectMessage(props.message.id);
  }
}
</script>

<template>
  <div
    class="bubble"
    :class="[
      props.message.role,
      { 'bubble--favorite': props.message.savedAsFavorite },
      { 'bubble--selected': props.message.role === 'assistant' && selectedMessageId === props.message.id },
    ]"
    @click="handleClick"
  >
    <p class="bubble__content">{{ props.message.content }}</p>
    <div class="bubble__footer">
      <span v-if="props.message.savedAsFavorite" class="bubble__favorite-badge" title="Guardado como favorito">⭐ Guardado</span>
      <span class="bubble__time">{{ formatTime(props.message.timestamp) }}</span>
    </div>
  </div>
</template>

<style scoped>
.bubble {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  padding: 10px 14px;
  border-radius: var(--radius-lg);
  gap: 4px;
}

.bubble.user {
  align-self: flex-end;
  background-color: var(--color-primary);
  border-bottom-right-radius: var(--radius-sm);
}

.bubble.assistant {
  align-self: flex-start;
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-sm);
  cursor: pointer;
}

.bubble.assistant:hover:not(.bubble--favorite):not(.bubble--selected) {
  border-color: rgba(99, 102, 241, 0.4);
}

.bubble--selected {
  border-color: rgba(99, 102, 241, 0.8) !important;
  background-color: rgba(99, 102, 241, 0.1) !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.bubble__content {
  font-size: 0.95rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bubble__time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  align-self: flex-end;
  margin-left: auto;
}

.bubble--favorite {
  border-color: rgba(250, 204, 21, 0.5);
  background-color: rgba(250, 204, 21, 0.06);
}

.bubble__favorite-badge {
  font-size: 0.72rem;
  color: rgb(250, 204, 21);
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
