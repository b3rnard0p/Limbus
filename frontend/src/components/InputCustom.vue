<template>
  <div class="relative mt-6 transition-all duration-300" :class="$attrs.class">
    
    <!-- Render based on type -->
    <template v-if="type === 'select'">
      <select
        :id="id"
        :name="name || id"
        :value="modelValue"
        @change="handleNormalChange"
        :required="required"
        :multiple="multiple"
        :disabled="disabled"
        @invalid="handleInvalid"
        class="custom-input"
        :class="[
          inputClasses, 
          multiple ? 'h-32' : '',
          isDarkMode ? 'dark-mode' : 'light-mode',
          customErrorMsg ? 'has-error' : ''
        ]"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <option value="" disabled>Selecione...</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </template>

    <template v-else-if="type === 'textarea'">
      <textarea
        :id="id"
        :name="name || id"
        :value="modelValue"
        @input="handleNormalChange"
        :required="required"
        :maxlength="maxLength"
        :rows="rows"
        :disabled="disabled"
        @invalid="handleInvalid"
        class="custom-input resize-none overflow-y-auto"
        :class="[
          inputClasses,
          isDarkMode ? 'dark-mode' : 'light-mode',
          customErrorMsg ? 'has-error' : ''
        ]"
        placeholder=" "
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </template>

    <template v-else>
      <input
        :id="id"
        :name="name || id"
        :type="currencyFormat ? 'text' : type"
        :value="displayValue"
        @input="currencyFormat ? handleCurrencyChange($event) : handleNormalChange($event)"
        :required="required"
        :minlength="minLength"
        :maxlength="maxLength"
        :pattern="pattern"
        :title="title"
        :autocomplete="autoComplete"
        :step="step"
        :min="min"
        :max="max"
        :disabled="disabled"
        :readonly="readOnly"
        @invalid="handleInvalid"
        class="custom-input"
        :class="[
          inputClasses,
          isDarkMode ? 'dark-mode' : 'light-mode',
          customErrorMsg ? 'has-error' : ''
        ]"
        placeholder=" "
        @focus="handleFocus"
        @blur="handleBlur"
        @wheel="handleWheel"
        @keydown="handleKeydown"
      />
    </template>

    <span
      ref="labelRef"
      class="floating-label"
      :class="[
        isActive ? 'is-active' : '',
        isDarkMode ? 'dark-label' : 'light-label'
      ]"
    >
      {{ label }}
    </span>

    <div 
      v-if="customErrorMsg"
      class="error-tooltip"
      :class="isDarkMode ? 'dark-mode' : 'light-mode'"
      @click="customErrorMsg = null"
      title="Clique para fechar"
    >
      <span class="text-sm font-semibold px-4 text-center text-red-600">
        {{ customErrorMsg }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDarkMode } from '../composables/useDarkMode';

const { isDarkMode } = useDarkMode();

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  id: String,
  type: {
    type: String,
    default: 'text'
  },
  label: String,
  autoComplete: String,
  required: Boolean,
  minLength: Number,
  maxLength: Number,
  pattern: String,
  title: String,
  step: [String, Number],
  min: [String, Number],
  max: [String, Number],
  multiple: Boolean,
  options: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Number,
    default: 3
  },
  currencyFormat: Boolean,
  alwaysFloating: Boolean,
  name: String,
  disabled: Boolean,
  readOnly: Boolean,
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'keydown']);

const isFocused = ref(false);
const customErrorMsg = ref(null);

watch(customErrorMsg, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      customErrorMsg.value = null;
    }, 5000);
  }
});

const handleInvalid = (e) => {
  e.preventDefault();
  const target = e.currentTarget;
  let message = target.validationMessage;
  
  message = message.replace(/\s*\(.*\)/, '');
  
  if (target.validity && target.validity.patternMismatch && target.title) {
    message = target.title;
  }
  
  customErrorMsg.value = message;
};

const formatToCurrency = (digits) => {
  if (digits === null || digits === undefined || digits === "") return "";
  const num = typeof digits === "string" ? parseFloat(digits) : digits;
  if (isNaN(num)) return "";
  return (num / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const displayValue = computed(() => {
  return props.currencyFormat ? formatToCurrency(props.modelValue) : props.modelValue;
});

const handleCurrencyChange = (e) => {
  if (customErrorMsg.value) customErrorMsg.value = null;
  const inputValue = e.target.value.replace(/\D/g, '');
  emit('update:modelValue', inputValue);
};

const handleNormalChange = (e) => {
  if (customErrorMsg.value) customErrorMsg.value = null;
  emit('update:modelValue', e.target.value);
};

const handleFocus = () => {
  isFocused.value = true;
  emit('focus');
};

const handleBlur = (e) => {
  isFocused.value = false;
  emit('blur', e);
};

const handleWheel = (e) => {
  if (props.type === "number") {
    e.currentTarget.blur();
  }
};

const handleKeydown = (e) => {
  if (props.type === "number") {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  }
  emit('keydown', e);
};

const isSelectAlwaysActive = props.type === "select";
const isActive = computed(() => {
  return props.alwaysFloating || 
         isSelectAlwaysActive || 
         isFocused.value || 
         (props.modelValue !== "" && props.modelValue !== 0 && props.modelValue !== null && props.modelValue !== undefined);
});

const inputClasses = computed(() => {
  let classes = "block w-full px-4 py-3 text-base font-semibold transition-all duration-300 outline-none ";
  if (props.type === 'number') {
    classes += "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ";
  }
  return classes;
});
</script>

<style scoped>
/* Estilização Neo-Brutalism */
.custom-input {
  border: 2px solid #C9A24B;
  border-radius: 8px;
  box-shadow: 3px 3px 0px 0px #8B1E1E;
}

.custom-input:focus {
  border-color: #8B1E1E;
  box-shadow: 2px 2px 0px 0px #8B1E1E; /* reduz a sombra pra dar efeito de press */
  transform: translate(1px, 1px);
}

/* Has Error */
.custom-input.has-error {
  border-color: #dc2626; /* red-600 */
}

/* Modos (Claro e Escuro) */
.light-mode {
  background-color: #fdfaf0;
  color: #191919;
}

.dark-mode {
  background-color: #191919;
  color: #f4f4f4;
}

/* Floating Label */
.floating-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-weight: 600;
  padding: 0 4px;
  transition: all 0.2s ease-in-out;
  z-index: 2;
  font-family: "Cinzel Decorative", serif; /* Aplicando a fonte do sistema */
}

.floating-label.is-active {
  top: 0; /* com translateY(-50%) fica exatamente no meio da borda */
  font-size: 0.85rem;
  line-height: 1;
}

.light-label {
  color: #191919;
}
.light-label.is-active {
  background-color: #fdfaf0;
  color: #8B1E1E;
}

.dark-label {
  color: #f4f4f4;
}
.dark-label.is-active {
  background-color: #191919;
  color: #C9A24B;
}

/* Error Tooltip */
.error-tooltip {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  border-radius: 12px;
  border: 2px solid #dc2626;
  padding: 8px;
  z-index: 9999;
  cursor: pointer;
  box-shadow: 4px 4px 0px 0px #8B1E1E;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
