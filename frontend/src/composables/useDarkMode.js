import { ref } from 'vue';

const isDarkMode = ref(false);

export function useDarkMode() {
  function toggleDarkMode(val) {
    if (typeof val === 'boolean') {
      isDarkMode.value = val;
    } else {
      isDarkMode.value = !isDarkMode.value;
    }
  }

  return {
    isDarkMode,
    toggleDarkMode
  };
}
