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
      class="h-full w-full rounded-[4px] border-4 border-[#ca8a04] bg-[#f0f9ff] px-3 font-display text-sm font-bold text-[#0369a1] shadow-[inset_0_0_8px_rgba(202,138,4,0.2),0_6px_10px_rgba(0,0,0,0.3)] outline-none transition-all placeholder:text-[#0369a1]/50 focus:border-[#a16207] focus:shadow-[inset_0_0_12px_rgba(202,138,4,0.4),0_6px_10px_rgba(0,0,0,0.3)]"
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
