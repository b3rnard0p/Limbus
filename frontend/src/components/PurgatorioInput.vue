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
      class="h-full w-full rounded-[4px] border-4 border-[#44403c] bg-[#a8a29e] px-3 font-display text-sm font-bold text-[#1c1917] shadow-[inset_0_0_8px_rgba(28,25,23,0.3),0_6px_10px_rgba(0,0,0,0.5)] outline-none transition-all placeholder:text-[#1c1917]/50 focus:border-[#292524] focus:shadow-[inset_0_0_12px_rgba(28,25,23,0.5),0_6px_10px_rgba(0,0,0,0.5)]"
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
