<script setup>
import { computed, ref, watch } from "vue";
import WindowModal from "../components/WindowModal.vue";
import { useDarkMode } from "../composables/useDarkMode";

const { isDarkMode } = useDarkMode();

const props = defineProps({
  pin: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["close"]);

const activePin = ref(null);
watch(() => props.pin, (newVal) => {
  if (newVal) {
    activePin.value = newVal;
  }
}, { immediate: true });

const allImages = computed(() => {
  if (!activePin.value) return [];
  const images = [];
  const pin = activePin.value;
  
  if (pin.gallery && pin.gallery.length > 0) {
    images.push(...pin.gallery);
  } else {
    // Fallback for older pins
    if (pin.imageUrl) images.push({ url: pin.imageUrl, title: "" });
    if (pin.imageUrls && pin.imageUrls.length > 0) {
      pin.imageUrls.forEach(url => {
        if (!images.some(img => img.url === url)) {
          images.push({ url, title: "" });
        }
      });
    }
  }
  
  return images;
});
</script>

<template>
  <WindowModal
    :is-open="!!pin"
    wide
    :title="activePin?.title || ''"
    @close="emit('close')"
  >
    <div v-if="activePin" :class="!isDarkMode ? 'text-ink' : 'text-[#f4f4f4]'">
        <!-- Seção: Imagens -->
        <div v-if="allImages.length > 0" class="mb-8">
          <h3 
            class="font-display font-bold text-lg mb-3 pb-1 border-b"
            :class="isDarkMode ? 'text-[#C9A24B] border-[#C9A24B]/30' : 'text-[#4a3326] border-ink/15'"
          >Imagens</h3>
          
          <!-- Única imagem -->
          <div v-if="allImages.length === 1">
            <figure class="flex flex-col gap-1">
              <img :src="allImages[0].url" :alt="activePin.title" class="aspect-video w-full rounded object-cover shadow-sm border border-gold/20" />
              <figcaption 
                v-if="allImages[0].title" 
                class="text-sm font-semibold text-center mt-1"
                :class="isDarkMode ? 'text-[#f4f4f4]/80' : 'text-[#5c4033]'"
              >{{ allImages[0].title }}</figcaption>
            </figure>
          </div>
          
          <!-- Múltiplas imagens em Grid -->
          <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <figure v-for="(img, idx) in allImages" :key="idx" class="flex flex-col gap-1">
              <img 
                :src="img.url" 
                :alt="img.title || `${activePin.title} - imagem ${idx + 1}`" 
                class="aspect-square w-full rounded object-cover shadow-sm border border-gold/20 hover:scale-[1.02] transition-transform cursor-pointer" 
              />
              <figcaption 
                v-if="img.title" 
                class="text-xs font-semibold text-center mt-1 line-clamp-2 px-1" 
                :class="isDarkMode ? 'text-[#f4f4f4]/80' : 'text-[#5c4033]'"
                :title="img.title"
              >
                {{ img.title }}
              </figcaption>
            </figure>
          </div>
        </div>

        <!-- Seção: Texto -->
        <div v-if="activePin.contentHtml && activePin.contentHtml.trim() !== '' && activePin.contentHtml !== '<p><br></p>'" class="mb-8">
          <h3 
            class="font-display font-bold text-lg mb-3 pb-1 border-b"
            :class="isDarkMode ? 'text-[#C9A24B] border-[#C9A24B]/30' : 'text-[#4a3326] border-ink/15'"
          >Texto</h3>
          <div class="rich-content font-display leading-7" v-html="activePin.contentHtml" />
        </div>
        
        <!-- Seção: Links -->
        <div v-if="activePin.references && activePin.references.length > 0" class="mb-2">
          <h3 
            class="font-display font-bold text-lg mb-3 pb-1 border-b"
            :class="isDarkMode ? 'text-[#C9A24B] border-[#C9A24B]/30' : 'text-[#4a3326] border-ink/15'"
          >Referências</h3>
          <ul class="flex flex-col gap-2 list-disc pl-5">
            <li v-for="(refItem, index) in activePin.references" :key="index">
              <a
                :href="refItem.url"
                target="_blank"
                rel="noopener noreferrer"
                class="underline font-semibold transition"
                :class="isDarkMode ? 'text-[#e56b4a] hover:text-[#ff8a66]' : 'text-[#b24a2d] hover:text-[#8a3821]'"
              >
                {{ refItem.title || refItem.url }}
              </a>
            </li>
          </ul>
        </div>
      </div>
  </WindowModal>
</template>
