<template>
  <WindowModal
    :isOpen="isOpen"
    title="Configurações"
    @close="$emit('close')"
    @update:isOpen="$emit('close')"
  >
    <!-- Aparência -->
    <h2 class="cinzel-decorative-bold text-2xl font-bold mb-4 border-b-4 border-[#C9A24B] pb-2" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
      Aparência
    </h2>
    <div class="space-y-6 mb-8">
      <div class="space-y-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="isDarkMode"
            @change="toggleDarkMode"
            class="w-5 h-5 rounded border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            :class="isDarkMode ? 'bg-[#191919]' : 'bg-[#fdfaf0]'"
          />
          <span class="cinzel-decorative-bold font-semibold text-lg" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
            Modo Escuro (Dark Mode)
          </span>
        </label>
      </div>

      <div class="space-y-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="skipIntro"
            @change="toggleSkipIntro"
            class="w-5 h-5 rounded border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            :class="isDarkMode ? 'bg-[#191919]' : 'bg-[#fdfaf0]'"
          />
          <span class="cinzel-decorative-bold font-semibold text-lg" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
            Pular Introdução
          </span>
        </label>
        <p class="text-sm opacity-80 ml-8 font-medium" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
          Se ativado, a animação de entrada (vídeo) não será mais exibida ao abrir o mapa.
        </p>
      </div>
    </div>

    <!-- Mapa -->
    <h2 class="cinzel-decorative-bold text-2xl font-bold mb-6 border-b-4 border-[#C9A24B] pb-2" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
      Opções do Mapa
    </h2>

    <div class="space-y-6">
      <div class="space-y-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="alwaysShowLabels"
            @change="$emit('update:alwaysShowLabels', $event.target.checked)"
            class="w-5 h-5 rounded border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            :class="isDarkMode ? 'bg-[#191919]' : 'bg-[#fdfaf0]'"
          />
          <span class="cinzel-decorative-bold font-semibold text-lg" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
            Sempre mostrar legendas
          </span>
        </label>
        <p class="text-sm opacity-80 ml-8 font-medium" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
          Se desativado, os nomes dos pontos aparecem apenas ao passar o mouse por cima.
        </p>
      </div>

      <div class="space-y-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="showPoliticalDivision"
            @change="$emit('update:showPoliticalDivision', $event.target.checked)"
            class="w-5 h-5 rounded border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            :class="isDarkMode ? 'bg-[#191919]' : 'bg-[#fdfaf0]'"
          />
          <span class="cinzel-decorative-bold font-semibold text-lg" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
            Mostrar Divisão Política
          </span>
        </label>
        <p class="text-sm opacity-80 ml-8 font-medium" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
          Exibe nomes de países, estados e cidades no Mapa Atual. Desative para ver apenas a visão de satélite pura.
        </p>
      </div>

      <div class="space-y-2">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            :checked="showJourney"
            @change="$emit('update:showJourney', $event.target.checked)"
            class="w-5 h-5 rounded border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            :class="isDarkMode ? 'bg-[#191919]' : 'bg-[#fdfaf0]'"
          />
          <span class="cinzel-decorative-bold font-semibold text-lg" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
            Mostrar Jornada Cronológica
          </span>
        </label>
        <p class="text-sm opacity-80 ml-8 font-medium" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">
          Oculta pins secundários e enumera a trilha principal da Divina Comédia através dos mapas na ordem cronológica dos Cantos.
        </p>
      </div>

      <div class="pt-6 border-t-4 border-[#C9A24B]">
        <h3 class="cinzel-decorative-bold font-bold text-xl mb-4" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">Filtro de Exibição dos Pins</h3>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="pinFilter"
              value="all"
              :checked="pinFilter === 'all'"
              @change="$emit('update:pinFilter', 'all')"
              class="w-4 h-4 border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            />
            <span class="cinzel-decorative-bold font-semibold text-base" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">Todos os pontos</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="pinFilter"
              value="portals"
              :checked="pinFilter === 'portals'"
              @change="$emit('update:pinFilter', 'portals')"
              class="w-4 h-4 border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            />
            <span class="cinzel-decorative-bold font-semibold text-base" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">Somente Portais</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="pinFilter"
              value="cantos"
              :checked="pinFilter === 'cantos'"
              @change="$emit('update:pinFilter', 'cantos')"
              class="w-4 h-4 border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            />
            <span class="cinzel-decorative-bold font-semibold text-base" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">Somente Cantos Vinculados</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="pinFilter"
              value="info"
              :checked="pinFilter === 'info'"
              @change="$emit('update:pinFilter', 'info')"
              class="w-4 h-4 border-2 border-[#C9A24B] text-[#8B1E1E] focus:ring-[#8B1E1E]"
            />
            <span class="cinzel-decorative-bold font-semibold text-base" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-[#191919]'">Somente Informações / Curiosidades</span>
          </label>
        </div>
      </div>
    </div>
  </WindowModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import WindowModal from './WindowModal.vue';
import { useDarkMode } from '../composables/useDarkMode';

const { isDarkMode, toggleDarkMode } = useDarkMode();

const skipIntro = ref(false);

onMounted(() => {
  skipIntro.value = localStorage.getItem('skipIntro') === 'true';
});

function toggleSkipIntro(event) {
  skipIntro.value = event.target.checked;
  localStorage.setItem('skipIntro', skipIntro.value);
}

const props = defineProps({
  isOpen: Boolean,
  alwaysShowLabels: Boolean,
  showPoliticalDivision: {
    type: Boolean,
    default: true
  },
  pinFilter: {
    type: String,
    default: 'all'
  },
  showJourney: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close', 'update:alwaysShowLabels', 'update:showPoliticalDivision', 'update:showJourney', 'update:pinFilter']);
</script>
