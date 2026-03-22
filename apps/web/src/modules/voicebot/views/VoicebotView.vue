<script setup lang="ts">
import { computed } from 'vue';
import { useVoicebot } from '../composables/useVoicebot';
import MessageList from '../components/MessageList.vue';
import SpeakButton from '../components/SpeakButton.vue';
import StatusIndicator from '../components/StatusIndicator.vue';
import TranscriptArea from '../components/TranscriptArea.vue';
import ErrorBanner from '../components/ErrorBanner.vue';
import TextInput from '../components/TextInput.vue';
import AudioMeter from '../components/AudioMeter.vue';
import ToolCallBanner from '../components/ToolCallBanner.vue';

const {
  messages,
  status,
  partialTranscript,
  lastToolResult,
  error,
  hasMessages,
  selectedMessageId,
  isListening,
  isVoiceSupported,
  toggleListening,
  sendTextMessage,
  clearError,
} = useVoicebot();

const isInputDisabled = computed(
  () => status.value === 'thinking' || status.value === 'speaking',
);

const selectedMessage = computed(() =>
  selectedMessageId.value
    ? messages.value.find(m => m.id === selectedMessageId.value)
    : null
);

function saveEvent(): void {
  if (selectedMessage.value) {
    sendTextMessage(`Guarda este evento como favorito: ${selectedMessage.value.content}`);
  } else {
    sendTextMessage('Quiero guardar el último evento como favorito');
  }
}
</script>

<template>
  <main class="voicebot">
    <header class="voicebot__header">
      <h1 class="voicebot__title">HistoriBot</h1>
      <p class="voicebot__subtitle">Tu guía de historia universal</p>
      <StatusIndicator :status="status" />
    </header>

    <section class="voicebot__body">
      <MessageList :messages="messages" :partial-transcript="partialTranscript" :status="status" />
    </section>

    <footer class="voicebot__footer">
      <TranscriptArea :text="partialTranscript" :status="status" />

      <ToolCallBanner v-if="lastToolResult" :tool-call="lastToolResult" />

      <AudioMeter :active="isListening" />

      <ErrorBanner v-if="error" :message="error" @dismiss="clearError" />

      <div class="voicebot__controls">
        <SpeakButton
          :status="status"
          :is-listening="isListening"
          :is-supported="isVoiceSupported"
          @toggle="toggleListening"
        />
        <TextInput :disabled="isInputDisabled" @send="sendTextMessage" />
        <button
          v-if="hasMessages"
          class="voicebot__save-btn"
          :class="{ 'voicebot__save-btn--active': selectedMessage }"
          :disabled="isInputDisabled"
          @click="saveEvent"
          :title="selectedMessage ? 'Guardar evento seleccionado' : 'Guardar último evento'"
        >
          ⭐
        </button>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.voicebot {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 16px;
}

.voicebot__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
}

.voicebot__title {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.voicebot__subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.voicebot__body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.voicebot__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0 28px;
  border-top: 1px solid var(--color-border);
  width: 100%;
}

.voicebot__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.voicebot__save-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.voicebot__save-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.15);
  transform: scale(1.08);
}

.voicebot__save-btn--active {
  background: rgba(250, 204, 21, 0.15);
  border-color: rgba(250, 204, 21, 0.6);
  box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.2);
}

.voicebot__save-btn--active:hover:not(:disabled) {
  background: rgba(250, 204, 21, 0.25);
}

.voicebot__save-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
