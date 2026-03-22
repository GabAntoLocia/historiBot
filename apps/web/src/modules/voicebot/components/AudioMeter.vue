<script setup lang="ts">
defineProps<{ active: boolean }>();
</script>

<template>
  <Transition name="fade">
    <div v-if="active" class="audio-meter" aria-hidden="true">
      <span class="audio-meter__label">🎙 Mic</span>
      <div class="audio-meter__track">
        <div class="audio-meter__bar" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.audio-meter {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.audio-meter__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.audio-meter__track {
  flex: 1;
  height: 6px;
  background-color: var(--color-surface-2);
  border-radius: 3px;
  overflow: hidden;
}

.audio-meter__bar {
  height: 100%;
  width: 40%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--color-success) 0%, #86efac 100%);
  animation: pulse-bar 1s ease-in-out infinite alternate;
  transform-origin: left;
}

@keyframes pulse-bar {
  from { width: 15%; opacity: 0.6; }
  to   { width: 85%; opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
