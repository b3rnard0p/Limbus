<template>
  <Transition name="modal-backdrop">
    <div class="window-modal-container" v-if="isOpen" @click.self="closeModal">
      <div 
        class="window-modal border-4 border-[#C9A24B]" 
        :class="[
          isDarkMode ? 'bg-[#191919] text-[#f4f4f4]' : 'bg-[#fdfaf0] text-[#191919]',
          wide ? 'is-wide' : ''
        ]"
      >
      
      <!-- Window Header -->
      <div 
        class="window-header border-b-4 border-[#C9A24B]"
        :class="isDarkMode ? 'bg-[#191919]' : 'bg-[#fdfaf0]'"
      >
        <h2 class="window-title cinzel-decorative-bold" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">{{ title }}</h2>
        <button 
          v-if="!hideCloseButton"
          class="window-close-btn" 
          @click="closeModal" 
          title="Fechar"
        >
          <X size="20" stroke-width="3" />
        </button>
      </div>
      
      <!-- Window Body -->
      <div 
        class="window-body p-4 sm:p-7"
        :class="isDarkMode ? 'dark-scroll' : 'light-scroll'"
      >
        <slot></slot>
      </div>

    </div>
    </div>
  </Transition>
</template>

<script setup>
import { X } from 'lucide-vue-next';
import { useDarkMode } from '../composables/useDarkMode';

const { isDarkMode } = useDarkMode();

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: "Window"
  },
  hideCloseButton: {
    type: Boolean,
    default: false
  },
  wide: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close", "update:isOpen"]);

function closeModal() {
  emit("update:isOpen", false);
  emit("close");
}
</script>

<style scoped>
/* Transition classes for backdrop */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Base styles for container */
.window-modal-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal Neo-Brutalism Style (System Colors Inverted & Rounded) */
.window-modal {
  width: 90vw;
  max-width: 500px;
  
  /* The thick solid border and flat shadow */
  border-radius: 16px;
  box-shadow: 12px 12px 0px 0px #8B1E1E; /* Sombra primária vinho */
  
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Corta os cantos do header */
  /* Use transition for the transform and opacity during leave */
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
}

/* Enter animation for modal box */
.modal-backdrop-enter-active .window-modal {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Leave animation for modal box */
.modal-backdrop-leave-to .window-modal {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.window-modal.is-wide {
  max-width: 800px;
}

/* Header bar with border bottom */
.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}

.window-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0;
}

/* Close button - Square, solid colors */
.window-close-btn {
  background: #C9A24B;
  color: #fdfaf0;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
}

.window-close-btn:hover {
  background: #8B1E1E;
}
.window-close-btn:active {
  transform: scale(0.9);
}

.window-body {
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scroll customizado - Claro */
.light-scroll::-webkit-scrollbar {
  width: 10px;
}
.light-scroll::-webkit-scrollbar-track {
  background: #fdfaf0;
  border-left: 2px solid #C9A24B;
}
.light-scroll::-webkit-scrollbar-thumb {
  background: #C9A24B;
}

/* Scroll customizado - Escuro */
.dark-scroll::-webkit-scrollbar {
  width: 10px;
}
.dark-scroll::-webkit-scrollbar-track {
  background: #191919;
  border-left: 2px solid #C9A24B;
}
.dark-scroll::-webkit-scrollbar-thumb {
  background: #C9A24B;
}

@keyframes popIn {
  0% {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
