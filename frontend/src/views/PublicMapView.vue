<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Globe2, Map, Search, X, Plus, Minus, Settings } from "lucide-vue-next";
import MapViewer from "../components/MapViewer.vue";
import ButtonCustom from "../components/ButtonCustom.vue";
import PinModal from "../components/PinModal.vue";
import SettingsModal from "../components/SettingsModal.vue";
import { fetchPins, fetchPinById } from "../services/api";
import { getMapConfig, MAP_OPTIONS } from "../services/maps";
import { justFinishedIntro } from "../composables/useIntroState";

const router = useRouter();
const currentMapId = ref("home-medieval");
const pins = ref([]);
const allPins = ref([]);
const selectedPin = ref(null);
const loading = ref(false);
const immersing = ref(false);
const mapViewer = ref(null);
const isSearchOpen = ref(false);
const isSettingsOpen = ref(false);
const searchQuery = ref("");
const alwaysShowLabels = ref(false);
const showPoliticalDivision = ref(true);
const showJourney = ref(false);
const pinFilter = ref("all");
const isGlobeMode = ref(false);

const currentMap = computed(() => getMapConfig(currentMapId.value));

const filteredPins = computed(() => {
  if (pinFilter.value === "all") return pins.value;
  if (pinFilter.value === "portals") return pins.value.filter(p => p.pinType === "portal");
  if (pinFilter.value === "cantos") return pins.value.filter(p => p.canto !== null && p.canto !== undefined);
  if (pinFilter.value === "info") return pins.value.filter(p => p.pinType === "editorial" && (p.canto === null || p.canto === undefined));
  return pins.value;
});





const canGoBack = computed(
  () => Boolean(currentMap.value.parentId) && currentMapId.value !== "earth-modern"
);

const searchResults = computed(() => {
  if (searchQuery.value === "") return [];
  const query = Number(searchQuery.value);
  if (isNaN(query)) return [];
  return allPins.value.filter(pin => pin.canto === query);
});

async function loadAllPins() {
  try {
    allPins.value = await fetchPins(null, true);
  } catch (err) {
    console.error("Erro ao carregar todos os pins", err);
  }
}

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value;
  if (isSearchOpen.value && allPins.value.length === 0) {
    loadAllPins();
  }
  if (!isSearchOpen.value) {
    searchQuery.value = "";
  }
}

async function openPin(pin) {
  loading.value = true;
  try {
    const fullPin = await fetchPinById(pin._id);
    selectedPin.value = fullPin;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function selectSearchResult(pin) {
  isSearchOpen.value = false;
  searchQuery.value = "";
  
  if (currentMapId.value !== pin.mapId) {
    currentMapId.value = pin.mapId;
    await new Promise(r => setTimeout(r, 600)); 
  }
  
  mapViewer.value?.focusAt(pin.x, pin.y);
  await openPin(pin);
}

async function loadPins() {
  try {
    loading.value = true;
    pins.value = await fetchPins(currentMapId.value, true);
    allPins.value = await fetchPins(null, true);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function enterPortal(portal) {
  if (!portal.targetMapId) return;

  mapViewer.value?.focusAt(portal.x, portal.y);

  await new Promise((resolve) => setTimeout(resolve, 650));
  immersing.value = true;

  await new Promise((resolve) => setTimeout(resolve, 700));
  currentMapId.value = portal.targetMapId;

  await new Promise((resolve) => setTimeout(resolve, 400));
  immersing.value = false;
}

function goBack() {
  currentMapId.value = currentMap.value.parentId || "home-medieval";
}

function toggleModernMap() {
  currentMapId.value =
    currentMapId.value === "earth-modern" ? "home-medieval" : "earth-modern";
}

let typedString = "";
function handleKeydown(e) {
  if (e.key && e.key.length === 1) {
    typedString += e.key.toLowerCase();
    if (typedString.length > 5) {
      typedString = typedString.slice(-5);
    }
    if (typedString === "dante") {
      router.push("/admin/mapa");
      typedString = "";
    }
  }
}

watch(currentMapId, loadPins);

onMounted(async () => {
  await loadAllPins();
  loadPins();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <main class="relative h-[100dvh] w-full overflow-hidden bg-night text-white">
    
    <SettingsModal 
      :is-open="isSettingsOpen" 
      v-model:always-show-labels="alwaysShowLabels"
      v-model:show-political-division="showPoliticalDivision"
      v-model:show-journey="showJourney"
      v-model:pinFilter="pinFilter"
      @close="isSettingsOpen = false" 
    />

    <MapViewer
      ref="mapViewer"
      :map-id="currentMapId"
      :pins="filteredPins"
      :all-pins="allPins"
      :always-show-labels="alwaysShowLabels"
      :show-political-division="showPoliticalDivision"
      :show-journey="showJourney"
      :globe-mode="isGlobeMode"
      @pin-select="openPin"
      @portal-select="enterPortal"
    />

    <!-- Logo Centralizado -->
    <div 
      class="pointer-events-none absolute z-[1050] hidden min-[930px]:block"
      :class="justFinishedIntro ? 'animate-fly-logo' : 'top-3 left-1/2 -translate-x-1/2 min-[930px]:top-5'"
    >
      <img src="/Logo.avif" alt="Limbus Logo" class="h-12 min-[930px]:h-16 w-auto" />
    </div>

    <!-- UI controls stay on top (z-index: 1000) -->
    <header
      class="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-start justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 min-[930px]:p-5"
    >
      <!-- Espaço Esquerdo (Voltar) -->
      <div class="flex-1 flex justify-start pointer-events-auto">
        <ButtonCustom
          v-if="canGoBack"
          text=""
          square
          title="Voltar"
          @click="goBack"
        >
          <template #icon>
            <ArrowLeft />
          </template>
        </ButtonCustom>
      </div>

      <!-- Navegação Principal -->
      <nav class="pointer-events-auto flex items-start gap-2 flex-shrink-0 min-[930px]:flex-1 min-[930px]:justify-end min-[930px]:mr-16">
        <!-- Toggle Mundo Real / Medieval -->
        <ButtonCustom
          :text="currentMapId === 'earth-modern' ? 'M. Medieval' : 'Mundo'"
          :title="currentMapId === 'earth-modern' ? 'Mapa medieval' : 'Mapa atual'"
          @click="toggleModernMap"
        >
          <template #icon>
            <Globe2 v-if="currentMapId !== 'earth-modern'" />
            <Map v-else />
          </template>
        </ButtonCustom>
        


        <!-- Bloco de Pesquisa -->
        <div class="flex items-start gap-2 relative">
          <ButtonCustom
            :text="isSearchOpen ? '' : 'Canto'"
            title="Buscar Canto"
            :isInput="isSearchOpen"
            v-model="searchQuery"
            class="transition-all"
            :class="isSearchOpen ? 'w-32 sm:w-48' : ''"
            @click="!isSearchOpen ? toggleSearch() : null"
            @close-input="toggleSearch"
          >
            <template #icon>
              <Search />
            </template>
          </ButtonCustom>
          
          <!-- Resultados com estética correspondente -->
          <Transition name="slide-left">
            <ul
              v-if="searchQuery !== '' && isSearchOpen"
              class="absolute top-[110%] right-0 mt-1 flex max-h-[50vh] w-48 flex-col gap-1 overflow-y-auto rounded-lg border-4 border-[#8B1E1E] bg-[#fdfaf0] p-2 shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
            >
              <li v-if="searchResults.length === 0" class="text-sm font-bold text-[#8B1E1E]">
                Nenhum ponto.
              </li>
              <li
                v-for="res in searchResults"
                :key="res._id"
                class="group cursor-pointer rounded border-2 border-[#C9A24B]/50 bg-white px-2 py-1.5 transition hover:border-[#C9A24B] hover:bg-[#C9A24B]"
                @click="selectSearchResult(res)"
              >
                <p class="font-display text-sm font-bold leading-tight text-[#8B1E1E] group-hover:text-white">
                  {{ res.title }}
                </p>
                <p class="mt-0.5 text-[10px] font-bold uppercase text-slate-500 group-hover:text-white/80">
                  {{ MAP_OPTIONS.find(m => m.id === res.mapId)?.label || res.mapId }}
                </p>
              </li>
            </ul>
          </Transition>
        </div>
      </nav>

      <!-- Espaço Direito (Apenas Mobile, para forçar a nav pro centro perfeito) -->
      <div class="flex-1 hidden max-[929px]:block pointer-events-none"></div>
    </header>

    <!-- Botão Configurações (Topo Direito em Telas Maiores) -->
    <div class="pointer-events-none absolute top-0 right-0 z-[1001] p-3 min-[930px]:p-5 hidden sm:block">
      <ButtonCustom
        class="pointer-events-auto"
        text=""
        square
        title="Configurações"
        @click="isSettingsOpen = true"
      >
        <template #icon>
          <Settings />
        </template>
      </ButtonCustom>
    </div>

    <!-- Controles Mobile (Canto Inferior Esquerdo) -->
    <div class="pointer-events-none absolute bottom-4 left-4 z-[1000] flex flex-col gap-2 sm:hidden">
      <ButtonCustom
        class="pointer-events-auto"
        text=""
        square
        title="Configurações"
        @click="isSettingsOpen = true"
      >
        <template #icon>
          <Settings />
        </template>
      </ButtonCustom>
    </div>

    <div
      v-if="loading"
      class="absolute bottom-4 left-4 z-[1000] rounded-md bg-black/55 px-3 py-2 text-sm text-white"
    >
      Carregando
    </div>

    <!-- Controles de Zoom -->
    <div class="pointer-events-none absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <!-- Toggle 2D / 3D -->
      <ButtonCustom
        v-show="currentMapId === 'earth-modern'"
        class="pointer-events-auto"
        text="3D"
        square
        :title="isGlobeMode ? 'Ver mapa 2D' : 'Ver globo 3D'"
        @click="isGlobeMode = !isGlobeMode"
      >
        <template #icon>
          <Map v-if="isGlobeMode" />
          <Globe2 v-else />
        </template>
      </ButtonCustom>

      <ButtonCustom
        class="pointer-events-auto"
        text="+"
        square
        title="Aproximar"
        @click="mapViewer?.zoomIn()"
      >
        <template #icon>
          <Plus />
        </template>
      </ButtonCustom>
      <ButtonCustom
        class="pointer-events-auto"
        text="-"
        square
        title="Afastar"
        @click="mapViewer?.zoomOut()"
      >
        <template #icon>
          <Minus />
        </template>
      </ButtonCustom>
    </div>

    <Transition name="immerse">
      <div
        v-if="immersing"
        class="pointer-events-none fixed inset-0 z-[2000] bg-black"
      />
    </Transition>

    <PinModal :pin="selectedPin" @close="selectedPin = null" />
  </main>
</template>

<style scoped>
.immerse-enter-active {
  transition: opacity 0.55s ease;
}
.immerse-leave-active {
  transition: opacity 0.4s ease;
}
.immerse-enter-from,
.immerse-leave-to {
  opacity: 0;
}
.immerse-enter-to,
.immerse-leave-from {
  opacity: 1;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Animação do logo "saindo" da intro pro topo */
.animate-fly-logo {
  animation: flyLogo 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes flyLogo {
  0% {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(3);
  }
  100% {
    top: 0.75rem; /* top-3 */
    left: 50%;
    transform: translate(-50%, 0) scale(1);
  }
}

@media (min-width: 930px) {
  @keyframes flyLogo {
    0% {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(4);
    }
    100% {
      top: 1.25rem; /* top-5 (min-[930px]:top-5) */
      left: 50%;
      transform: translate(-50%, 0) scale(1);
    }
  }
}
</style>
