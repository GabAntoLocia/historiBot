<script setup lang="ts">
defineProps<{ message: string }>();
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <Transition name="slide">
    <div class="error-banner" role="alert">
      <span class="error-banner__icon" aria-hidden="true">⚠</span>
      <p class="error-banner__message">{{ message }}</p>
      <button
        class="error-banner__close"
        aria-label="Cerrar error"
        @click="emit('dismiss')"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.error-banner {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius-md);
  color: #fca5a5;
  font-size: 0.875rem;
}

.error-banner__icon {
  flex-shrink: 0;
  font-size: 0.95rem;
  margin-top: 1px;
}

.error-banner__message {
  flex: 1;
  line-height: 1.45;
}

.error-banner__close {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: #fca5a5;
  opacity: 0.65;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition);
}

.error-banner__close:hover {
  opacity: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity var(--transition),
    transform var(--transition);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
