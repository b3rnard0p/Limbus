<template>
  <div class="relative inline-flex h-11 items-center">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :min="min"
      :max="max"
      :autofocus="autofocus"
      :placeholder="placeholder"
      class="h-full w-full rounded-[4px] border-4 border-[#3e2312] bg-[#ebd5ab] px-3 font-display text-sm font-bold text-[#2c1a0e] shadow-[inset_0_0_8px_rgba(139,90,43,0.4),0_6px_10px_rgba(0,0,0,0.5)] outline-none transition-all placeholder:text-[#5e3a21]/60 focus:border-[#7b3c22] focus:shadow-[inset_0_0_12px_rgba(139,90,43,0.6),0_6px_10px_rgba(0,0,0,0.5)]"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  min: { type: [String, Number], default: null },
  max: { type: [String, Number], default: null },
  placeholder: { type: String, default: "" },
  autofocus: { type: Boolean, default: false }
});

defineEmits(["update:modelValue"]);
</script>
