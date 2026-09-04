import { ref } from 'vue';

const toastMessage = ref('');
const toastType = ref('error'); // 'error', 'success', etc.
let timeoutId = null;

export function useToast() {
  const showToast = (message, type = 'error', duration = 4000) => {
    toastMessage.value = message;
    toastType.value = type;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      toastMessage.value = '';
    }, duration);
  };

  const hideToast = () => {
    toastMessage.value = '';
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return {
    toastMessage,
    toastType,
    showToast,
    hideToast
  };
}
