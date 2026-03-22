<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ send: [text: string] }>();

const input = ref('');

function submit(): void {
  const text = input.value.trim();
  if (!text || props.disabled) return;
  emit('send', text);
  input.value = '';
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submit();
  }
}
</script>

<template>
  <div class="text-input">
    <input
      v-model="input"
      class="text-input__field"
      type="text"
      placeholder="O escribe tu pregunta aquí…"
      :disabled="disabled"
      maxlength="500"
      @keydown="onKeydown"
    />
    <button
      class="text-input__send"
      :disabled="disabled || !input.trim()"
      aria-label="Enviar"
      @click="submit"
    >
      ➤
    </button>
  </div>
</template>

<style scoped>
.text-input {
  display: flex;
  width: 100%;
  gap: 8px;
}

.text-input__field {
  flex: 1;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 10px 14px;
  outline: none;
  transition: border-color var(--transition);
}

.text-input__field::placeholder {
  color: var(--color-text-muted);
}

.text-input__field:focus {
  border-color: var(--color-primary);
}

.text-input__field:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.text-input__send {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color var(--transition),
    opacity var(--transition);
}

.text-input__send:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.text-input__send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
