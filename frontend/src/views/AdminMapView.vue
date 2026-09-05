<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Eye, LogOut, Pencil, Trash2, Globe2, Map, Search, X, Plus, Minus, Settings } from "lucide-vue-next";
import AdminPanel from "../components/AdminPanel.vue";
import MapViewer from "../components/MapViewer.vue";
import PinModal from "../components/PinModal.vue";
import SettingsModal from "../components/SettingsModal.vue";
import ButtonCustom from "../components/ButtonCustom.vue";
import WindowModal from "../components/WindowModal.vue";
import {
  logoutUser,
  createPin,
  deletePin,
  fetchPins,
  fetchPinById,
  updatePin
} from "../services/api";
import { MAP_OPTIONS, getMapConfig } from "../services/maps";

const router = useRouter();
const currentMapId = ref("home-medieval");
const pins = ref([]);
const allPins = ref([]);
const activePin = ref(null);
const previewPin = ref(null);
const contextPin = ref(null);
const saving = ref(false);
const currentMap = computed(() => getMapConfig(currentMapId.value));

const mapViewer = ref(null);
const isSearchOpen = ref(false);
const isSettingsOpen = ref(false);
const searchQuery = ref("");
const alwaysShowLabels = ref(false);
const showPoliticalDivision = ref(true);
const showJourney = ref(false);
const pinFilter = ref("all");
const immersing = ref(false);
const isGlobeMode = ref(false);

const filteredPins = computed(() => {
  if (pinFilter.value === "all") return pins.value;
  if (pinFilter.value === "portals") return pins.value.filter(p => p.pinType === "portal");
  if (pinFilter.value === "cantos") return pins.value.filter(p => p.canto !== null && p.canto !== undefined);
  if (pinFilter.value === "info") return pins.value.filter(p => p.pinType === "editorial" && (p.canto === null || p.canto === undefined));
  return pins.value;
});



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

async function selectSearchResult(pin) {
  isSearchOpen.value = false;
  searchQuery.value = "";
  if (currentMapId.value !== pin.mapId) {
    currentMapId.value = pin.mapId;
    await new Promise(r => setTimeout(r, 600)); 
  }
  mapViewer.value?.focusAt(pin.x, pin.y);
  openContextMenu(pin);
}

function toggleModernMap() {
  currentMapId.value =
    currentMapId.value === "earth-modern" ? "home-medieval" : "earth-modern";
}

const canGoBack = computed(
  () => currentMap.value.parentId && currentMapId.value !== "earth-modern"
);

function goBack() {
  if (currentMap.value.parentId) {
    currentMapId.value = currentMap.value.parentId;
  }
}

async function enterPortal(pin) {
  if (pin.targetMapId) {
    closeContext();
    mapViewer.value?.focusAt(pin.x, pin.y);
    await new Promise((resolve) => setTimeout(resolve, 650));
    immersing.value = true;
    await new Promise((resolve) => setTimeout(resolve, 700));
    currentMapId.value = pin.targetMapId;
    await new Promise((resolve) => setTimeout(resolve, 400));
    immersing.value = false;
  }
}

import { useToast } from "../composables/useToast";

const { showToast } = useToast();

async function loadPins() {
  try {
    pins.value = await fetchPins(currentMapId.value, true);
    allPins.value = await fetchPins(null, true);
  } catch (err) {
    // api.js já dispara o toast de erro, então não precisamos chamar showToast('...', 'error') aqui.
    console.error(err);
  }
}

function openContextMenu(pin) {
  contextPin.value = pin;
}

function closeContext() {
  contextPin.value = null;
}

async function contextView() {
  const fullPin = await fetchPinById(contextPin.value._id);
  previewPin.value = fullPin;
  closeContext();
}

async function contextEdit() {
  const fullPin = await fetchPinById(contextPin.value._id);
  activePin.value = { ...fullPin };
  closeContext();
}

async function contextDelete() {
  if (!contextPin.value?._id) return;

  saving.value = true;

  try {
    await deletePin(contextPin.value._id);
    closeContext();
    await loadPins();
    showToast("Pin excluído.", "success");
  } catch (err) {
    // api.js já cuida do erro
    console.error(err);
  } finally {
    saving.value = false;
  }
}

function openNewPin(point) {
  contextPin.value = null;
  activePin.value = {
    mapId: currentMapId.value,
    title: "",
    contentHtml: "",
    x: point.x,
    y: point.y
  };
}

function toFormData(payload) {
  const formData = new FormData();
  formData.append("mapId", currentMapId.value);
  formData.append("title", payload.title);
  formData.append("contentHtml", payload.contentHtml || "");
  formData.append("pinType", payload.pinType || "editorial");
  formData.append("targetMapId", payload.targetMapId || "");
  formData.append("x", activePin.value.x);
  formData.append("y", activePin.value.y);

  if (payload.canto !== undefined && payload.canto !== null && payload.canto !== "") {
    formData.append("canto", payload.canto);
  }
  
  formData.append("isCuriosity", Boolean(payload.isCuriosity));

  if (payload.references && payload.references.length > 0) {
    formData.append("references", JSON.stringify(payload.references));
  } else {
    formData.append("references", "[]");
  }

  if (payload.newImages && payload.newImages.length > 0) {
    payload.newImages.forEach(img => formData.append("images", img.file));
    formData.append("newImageTitles", JSON.stringify(payload.newImages.map(img => img.title || "")));
  }
  
  if (payload.existingImages) {
    formData.append("existingImages", JSON.stringify(payload.existingImages));
  }

  if (payload.pinImage) formData.append("pinImage", payload.pinImage);

  return formData;
}

async function savePin(payload) {
  saving.value = true;

  try {
    const formData = toFormData(payload);

    if (activePin.value._id) {
      await updatePin(activePin.value._id, formData);
    } else {
      await createPin(formData);
    }

    activePin.value = null;
    await loadPins();
    showToast("Salvo com sucesso.", "success");
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
}

async function removePin() {
  if (!activePin.value?._id) return;

  saving.value = true;

  try {
    await deletePin(activePin.value._id);
    activePin.value = null;
    await loadPins();
    showToast("Pin excluído.", "success");
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
}

async function logout() {
  await logoutUser();
  router.push({ name: "login" });
}

watch(currentMapId, () => {
  activePin.value = null;
  contextPin.value = null;
  loadPins();
});

onMounted(async () => {
  await loadAllPins();
  loadPins();
});
</script>

<template>
  <main class="relative h-screen w-full overflow-hidden bg-night text-white">
    
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
      admin
      @map-click="openNewPin"
      @pin-admin-click="openContextMenu"
    />

    <!-- Logo Centralizado -->
    <div class="pointer-events-none absolute top-3 left-1/2 z-[1050] -translate-x-1/2 hidden sm:block sm:top-5">
      <img src="/Logo.avif" alt="Limbus Logo" class="h-12 sm:h-16 w-auto" />
    </div>

    <!-- Header do Admin (Similar ao Público) -->
    <header
      class="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-5"
    >
      <div class="pointer-events-auto hidden sm:flex items-center gap-2">
        <!-- Botão Sair flutuante alinhado à esquerda -->
        <ButtonCustom
          icon="LogOut"
          square
          title="Sair do Modo Admin"
          @click="logout"
        />
      </div>

      <nav class="pointer-events-auto flex items-start gap-2">
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

        <!-- Bloco de Pesquisa Expansível dentro do Botão -->
        <div class="relative flex flex-col items-end z-[2000]">
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

        <!-- Botão de Configurações -->
        <div class="hidden sm:block">
          <ButtonCustom
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
      </nav>
    </header>

    <!-- Controles de Admin (Mobile) -->
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

      <ButtonCustom
        class="pointer-events-auto"
        icon="LogOut"
        square
        title="Sair do Modo Admin"
        @click="logout"
      />
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

    <!-- Modal de Contexto (Admin) -->
    <WindowModal
      :is-open="!!contextPin"
      :title="contextPin?.pinType === 'portal' ? 'Portal' : 'Editorial'"
      @close="closeContext"
    >
      <div class="flex flex-col gap-4 p-5">
        <p class="truncate text-xl font-bold cinzel-decorative-bold text-center mb-2">
          {{ contextPin?.title }}
        </p>

        <ButtonCustom
          v-if="contextPin?.pinType === 'portal'"
          text="Atravessar Portal"
          icon="Eye"
          type="button"
          @click="enterPortal(contextPin)"
        />

        <ButtonCustom
          v-if="contextPin?.pinType !== 'portal'"
          text="Ver como visitante"
          icon="Eye"
          type="button"
          @click="contextView"
        />

        <ButtonCustom
          text="Editar pin"
          icon="Pencil"
          type="button"
          @click="contextEdit"
        />

        <ButtonCustom
          text="Excluir pin"
          loadingText="Excluindo…"
          :loading="saving"
          icon="Trash2"
          type="button"
          :disabled="saving"
          @click="contextDelete"
        />
      </div>
    </WindowModal>

    <!-- Painel de edição -->
    <AdminPanel
      v-model="activePin"
      :saving="saving"
      @save="savePin"
      @delete="removePin"
      @close="activePin = null"
    />

    <PinModal :pin="previewPin" @close="previewPin = null" />
  </main>
</template>

<style scoped>
.ctx-enter-active,
.ctx-leave-active {
  transition: opacity 0.18s ease;
}
.ctx-enter-from,
.ctx-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

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
  transition: all 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
