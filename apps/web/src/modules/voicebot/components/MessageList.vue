<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { LocalMessage, VoicebotStatus } from '@/shared/types/voicebot.types';
import MessageBubble from './MessageBubble.vue';

const props = defineProps<{
  messages: LocalMessage[];
  partialTranscript: string;
  status: VoicebotStatus;
}>();

const listRef = ref<HTMLElement | null>(null);

watch(
  () => [props.messages.length, props.partialTranscript, props.status],
  async () => {
    await nextTick();
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight;
    }
  },
);
</script>

<template>
  <div ref="listRef" class="message-list">
    <div v-if="!messages.length && !partialTranscript && status === 'idle'" class="message-list__empty">
      <p>Presiona <strong>Hablar</strong> para comenzar.</p>
    </div>

    <template v-else>
      <MessageBubble v-for="msg in messages" :key="msg.id" :message="msg" />

      <!-- Partial transcript bubble (interim speech results) -->
      <div v-if="partialTranscript" class="bubble user partial">
        <p class="bubble__content">{{ partialTranscript }}</p>
      </div>

      <!-- Listening placeholder bubble (no words yet) -->
      <div
        v-else-if="!messages.length && (status === 'listening' || status === 'transcribing')"
        class="bubble user partial listening-pulse"
      >
        <p class="bubble__content">🎙 Escuchando…</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  scroll-behavior: smooth;
}

.message-list::-webkit-scrollbar {
  width: 4px;
}
.message-list::-webkit-scrollbar-track {
  background: transparent;
}
.message-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.message-list__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
}

/* Partial transcript bubble mirrors user style but faded */
.bubble {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 20px;
  gap: 4px;
}

.bubble.user {
  align-self: flex-end;
  background-color: var(--color-primary);
  border-bottom-right-radius: 6px;
}

.bubble__content {
  font-size: 0.95rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.partial {
  opacity: 0.55;
  font-style: italic;
}

.listening-pulse {
  animation: pulse-opacity 1.5s ease-in-out infinite;
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 0.7; }
}
</style>
