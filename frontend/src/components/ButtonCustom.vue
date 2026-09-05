<template>
  <button 
    :class="[
      'button', 
      { 'button-square': square },
      { 'active': active || loading || isInput },
      `button-size-${size}`,
      `button-variant-${variant}`,
      { 'no-icon': !hasIcon && !loading && !isInput }
    ]" 
    :title="title" 
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span class="icon" :class="{ 'input-mode': isInput }" v-if="hasIcon || loading || isInput">
      <Loader2 v-if="loading" class="animate-spin" />
      <div v-else-if="isInput" class="flex items-center w-full h-full px-1 justify-between">
        <input 
          ref="inputRef"
          class="custom-btn-input flex-1 min-w-0"
          type="number"
          min="0"
          max="100"
          placeholder="Nº..."
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          @click.stop
          @keydown.enter.prevent
        />
        <X class="h-5 w-5 shrink-0 cursor-pointer text-white hover:text-[#fca5a5] transition-colors mr-1" @click.stop="$emit('close-input')" />
      </div>
      <slot name="icon" v-else>
        <component :is="iconComponent" v-if="iconComponent" />
      </slot>
    </span>
    <span class="text-content" v-if="!square && text">
      <slot>{{ loading ? (loadingText || text) : text }}</slot>
    </span>
  </button>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import * as icons from 'lucide-vue-next';
import { Loader2, X } from 'lucide-vue-next';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ""
  },
  isInput: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [String, Number],
    default: ""
  },
  text: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: "ArrowRight"
  },
  square: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: "default", // default | small
  },
  variant: {
    type: String,
    default: "primary", // primary | danger | outline
  },
  type: {
    type: String,
    default: "button"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  }
});

defineEmits(["click", "update:modelValue", "close-input"]);

const iconComponent = computed(() => icons[props.icon]);
import { useSlots } from 'vue';
const slots = useSlots();
const hasIcon = computed(() => !!slots.icon || !!props.icon);

const inputRef = ref(null);
watch(() => props.isInput, async (val) => {
  if (val) {
    await nextTick();
    inputRef.value?.focus();
  }
});
</script>

<style scoped>
/* From Uiverse.io by fanishah */ 
.button {
  font-family: inherit;
  background: #8B1E1E;
  color: white;
  padding: 0.35em 0;
  font-size: 17px;
  border: none;
  border-radius: 0.7em;
  letter-spacing: 0.08em;
  position: relative;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tamanhos */
.button-size-default {
  font-size: 17px;
  height: 2.5em;
  padding-left: 2.8em;
  padding-right: 0.92em;
}

.button-size-small {
  font-size: 14px;
  height: 2em;
  padding-left: 2.2em;
  padding-right: 0.6em;
  border-radius: 0.5em;
}

/* Sem ícone */
.button.no-icon {
  padding-left: 1em;
  padding-right: 1em;
}

/* Variantes */
.button-variant-primary {
  background: #8B1E1E;
}
.button-variant-primary .icon {
  background: #C9A24B;
}

.button-variant-danger {
  background: #dc2626; /* Tailwind red-600 */
}
.button-variant-danger .icon {
  background: #991b1b; /* Tailwind red-800 */
}

.button-variant-outline {
  background: transparent;
  color: #8B1E1E;
  border: 2px solid #8B1E1E;
}
.button-variant-outline .icon {
  background: #8B1E1E;
  left: 0; /* adjust for border */
}

.button-size-default.button-square {
  padding-left: 0;
  padding-right: 0;
  width: 2.5em;
}

.button-size-small.button-square {
  padding-left: 0;
  padding-right: 0;
  width: 2em;
}

.button-size-default .icon {
  height: 2em;
  width: 2em;
  left: 0.25em;
}

.button-size-small .icon {
  height: 1.6em;
  width: 1.6em;
  left: 0.2em;
}

.button .icon {
  border-radius: 2em;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0.25em;
  transition: all 0.5s;
  z-index: 2; /* Ensure the icon background stays above the text */
}

.custom-btn-input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 10px;
  color: #191919;
  font-weight: bold;
  text-align: center;
  -moz-appearance: textfield;
}
.custom-btn-input::-webkit-outer-spin-button,
.custom-btn-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.custom-btn-input::placeholder {
  color: rgba(25, 25, 25, 0.6);
}

.icon :deep(svg:not(.animate-spin)) {
  transition: all 0.5s;
  color: white;
}

.icon :deep(svg.animate-spin) {
  color: white;
}

.button-size-default .icon :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
}

.button-size-small .icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}

/* Hover e Active effects */
.button:hover .icon :deep(svg:not(.animate-spin)),
.button.active .icon :deep(svg:not(.animate-spin)) {
  transform: rotate(360deg);
}

.button:not(.button-square):hover .icon,
.button.active:not(.button-square) .icon {
  width: calc(100% - 0.5rem);
  border-radius: 0.5em;
}

.text-content {
  z-index: 1;
  transition: color 0.5s;
}
</style>
