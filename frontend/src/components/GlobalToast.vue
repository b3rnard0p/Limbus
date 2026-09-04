<script setup>
import { useToast } from '../composables/useToast';

const { toastMessage, toastType } = useToast();
</script>

<template>
  <Transition name="global-toast">
    <div
      v-if="toastMessage"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full flex items-center gap-3 text-sm font-semibold max-w-[90vw] text-center"
      :class="[
        toastType === 'error' ? 'bg-[#8B1E1E] text-white' : 'bg-green-800 text-white'
      ]"
    >
      {{ toastMessage }}
    </div>
  </Transition>
</template>

<style scoped>
.global-toast-enter-active,
.global-toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.global-toast-enter-from,
.global-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
