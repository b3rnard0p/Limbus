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
      class="h-full w-full rounded-[4px] border-4 border-[#1a0505] bg-[#3f0b0b] px-3 font-display text-sm font-bold text-[#fca5a5] shadow-[inset_0_0_8px_rgba(220,38,38,0.4),0_6px_10px_rgba(0,0,0,0.8)] outline-none transition-all placeholder:text-[#fca5a5]/50 focus:border-[#450a0a] focus:shadow-[inset_0_0_12px_rgba(220,38,38,0.6),0_6px_10px_rgba(0,0,0,0.8)] drop-shadow-[0_0_2px_rgba(220,38,38,0.3)]"
    />
  </div>
</template>

<script setup>
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
