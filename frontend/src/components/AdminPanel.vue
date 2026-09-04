<script setup>
import { computed, ref, watch } from "vue";
import { ImagePlus, MapPin, Save, X, Plus, Trash2 } from "lucide-vue-next";
import { QuillEditor } from "@vueup/vue-quill";
import { MAP_OPTIONS } from "../services/maps";
import WindowModal from "../components/WindowModal.vue";
import ButtonCustom from "../components/ButtonCustom.vue";
import InputCustom from "../components/InputCustom.vue";
import { useDarkMode } from "../composables/useDarkMode";

const { isDarkMode } = useDarkMode();

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["save", "delete", "close"]);

const title = ref("");
const contentHtml = ref("");
const pinType = ref("editorial");
const targetMapId = ref("");
const canto = ref("");
const isCuriosity = ref(false);
const newImages = ref([]);
const existingImages = ref([]);
const pinImage = ref(null);
const references = ref([]);

const isEditing = computed(() => Boolean(props.modelValue?._id));
const isPortal = computed(() => pinType.value === "portal");

const targetOptions = computed(() => {
  const currentMapId = props.modelValue?.mapId;
  return MAP_OPTIONS.filter((m) => m.id !== currentMapId);
});

function resetFromModel() {
  if (!props.modelValue) return; // Keep old values while fading out
  const pin = props.modelValue;
  title.value = pin?.title || "";
  contentHtml.value = pin?.contentHtml || "";
  pinType.value = pin?.pinType || "editorial";
  targetMapId.value = pin?.targetMapId || "";
  canto.value = pin?.canto !== undefined && pin?.canto !== null ? pin.canto : "";
  isCuriosity.value = pin?.isCuriosity || false;
  newImages.value = [];
  
  if (pin?.gallery && pin.gallery.length > 0) {
    existingImages.value = JSON.parse(JSON.stringify(pin.gallery));
  } else if (pin?.imageUrls && pin.imageUrls.length > 0) {
    existingImages.value = pin.imageUrls.map(url => ({ title: "", url }));
  } else if (pin?.imageUrl) {
    existingImages.value = [{ title: "", url: pin.imageUrl }];
  } else {
    existingImages.value = [];
  }
  pinImage.value = null;
  references.value = pin?.references ? JSON.parse(JSON.stringify(pin.references)) : [];
}

function addNewImage() {
  newImages.value.push({ id: Date.now(), file: null, title: "" });
}

function removeNewImage(index) {
  newImages.value.splice(index, 1);
}

function onNewImageSelected(index, event) {
  const file = event.target.files?.[0];
  if (file) {
    newImages.value[index].file = file;
  }
}

function addReference() {
  references.value.push({ title: "", url: "" });
}

function removeReference(index) {
  references.value.splice(index, 1);
}

function submit() {
  emit("save", {
    title: title.value,
    contentHtml: contentHtml.value,
    pinType: pinType.value,
    targetMapId: isPortal.value ? targetMapId.value : "",
    canto: canto.value !== "" ? Number(canto.value) : "",
    isCuriosity: isCuriosity.value,
    images: newImages.value.map(item => item.file).filter(Boolean), // keep for backwards compatibility if needed
    newImages: newImages.value.filter(item => item.file),
    existingImages: existingImages.value,
    pinImage: pinImage.value,
    references: references.value.filter(r => r.title || r.url)
  });
}

watch(() => props.modelValue, resetFromModel, { immediate: true });
</script>

<template>
  <WindowModal
    :is-open="!!modelValue"
    :title="isEditing ? `Editar pin` : `Novo pin`"
    @close="emit('close')"
  >
    <form class="flex flex-col" @submit.prevent="submit" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-slate-900'">
      <div class="space-y-5 p-1">

            <!-- Tipo de pin -->
            <div>
              <span class="mb-2 block text-sm font-semibold text-slate-700">Tipo de pin</span>
              <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1 flex">
                  <ButtonCustom
                    text="Editorial"
                    icon="MapPin"
                    class="w-full"
                    :active="pinType === 'editorial'"
                    @click="pinType = 'editorial'"
                  />
                </div>
                <div class="flex-1 flex">
                  <ButtonCustom
                    text="Portal"
                    icon="Aperture"
                    class="w-full"
                    :active="pinType === 'portal'"
                    @click="pinType = 'portal'"
                  />
                </div>
              </div>
            </div>

            <!-- Mapa de destino (portais) -->
            <div v-if="isPortal">
              <InputCustom
                type="select"
                label="Mapa de destino"
                v-model="targetMapId"
                :options="targetOptions.map(opt => ({ value: opt.id, label: opt.label }))"
                required
              />
            </div>

            <!-- Título -->
            <InputCustom
              v-model="title"
              label="Título"
              :maxLength="140"
              required
            />

            <!-- Canto (Opcional) -->
            <InputCustom
              type="number"
              v-model="canto"
              label="Vincular a um Canto"
              :min="0"
              :max="100"
            />
            
            <!-- Marcar como curiosidade -->
            <div v-if="!isPortal" class="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isCuriosity" 
                v-model="isCuriosity" 
                class="w-4 h-4 text-[#8B1E1E] bg-gray-100 border-gray-300 rounded focus:ring-[#8B1E1E]"
              >
              <label for="isCuriosity" class="text-sm font-semibold text-slate-700">
                Curiosidade
              </label>
            </div>

            <!-- Texto rico (somente editorial) -->
            <div v-if="!isPortal">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700">Texto</span>
              <QuillEditor
                v-model:content="contentHtml"
                content-type="html"
                theme="snow"
                toolbar="essential"
                class="min-h-[160px] bg-white text-slate-900"
              />
            </div>

            <!-- Referências (somente editorial) -->
            <div v-if="!isPortal">
              <div class="flex items-center justify-center gap-3 mb-4 mt-2">
                <span class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-slate-700'">Referências</span>
                <ButtonCustom
                  square
                  icon="Plus"
                  size="small"
                  type="button"
                  @click="addReference"
                />
              </div>
              <div class="space-y-3 flex flex-col items-center w-full">
                <div v-for="(refItem, index) in references" :key="index" class="flex gap-2 items-center p-2 rounded w-full">
                  <div class="flex-1 flex flex-col justify-center">
                    <InputCustom
                      v-model="refItem.title"
                      label="Título da referência"
                      class="!mt-0 mb-3"
                    />
                    <InputCustom
                      type="url"
                      v-model="refItem.url"
                      label="URL (https://...)"
                      class="!mt-2"
                    />
                  </div>
                  <ButtonCustom
                    icon="Trash2"
                    size="small"
                    square
                    type="button"
                    title="Remover"
                    @click="removeReference(index)"
                  />
                </div>
                <p v-if="references.length === 0" class="text-xs text-slate-400 italic text-center w-full">
                  Nenhuma referência adicionada.
                </p>
              </div>
            </div>

            <!-- Imagens de referência (somente editorial) -->
            <div v-if="!isPortal">
              <div class="flex items-center justify-center gap-3 mb-4 mt-2">
                <span class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-slate-700'">Imagens de Referência</span>
                <ButtonCustom
                  square
                  icon="Plus"
                  size="small"
                  type="button"
                  @click="addNewImage"
                />
              </div>

              <div class="space-y-3 flex flex-col items-center w-full">
                <!-- Imagens Existentes -->
                <div v-for="(imgItem, index) in existingImages" :key="'exist-'+index" class="flex gap-2 items-center p-2 rounded w-full">
                  <div class="flex-1 flex flex-col justify-center gap-2">
                    <div class="flex items-center gap-3">
                      <img :src="imgItem.url" class="h-12 w-12 object-cover rounded border border-slate-200" />
                      <span class="flex-1 text-sm text-slate-500 truncate text-center">Imagem já salva</span>
                    </div>
                    <InputCustom
                      v-model="imgItem.title"
                      label="Legenda da imagem"
                      class="!mt-2"
                    />
                  </div>
                  <ButtonCustom
                    icon="Trash2"
                    size="small"
                    square
                    type="button"
                    title="Remover"
                    @click="existingImages.splice(index, 1)"
                  />
                </div>

                <!-- Novas Imagens -->
                <div v-for="(imgItem, index) in newImages" :key="imgItem.id" class="flex gap-2 items-center p-2 rounded w-full">
                  <div class="flex-1 flex flex-col justify-center gap-2">
                    <input
                      class="block w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-[#8B1E1E] file:px-2 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-[#6c1616] cursor-pointer"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      @change="onNewImageSelected(index, $event)"
                    />
                    <InputCustom
                      v-model="imgItem.title"
                      label="Legenda da imagem"
                      class="!mt-2"
                    />
                  </div>
                  <ButtonCustom
                    icon="Trash2"
                    size="small"
                    square
                    type="button"
                    title="Remover"
                    @click="removeNewImage(index)"
                  />
                </div>

                <p v-if="existingImages.length === 0 && newImages.length === 0" class="text-xs text-slate-400 italic text-center w-full">
                  Nenhuma imagem adicionada.
                </p>
              </div>
            </div>

            <!-- Ícone personalizado do pin -->
            <div class="flex flex-col gap-2 mb-4 mt-2">
              <div class="flex items-center justify-center gap-3">
                <span class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-[#f4f4f4]' : 'text-slate-700'">Ícone do Pin</span>
                <ButtonCustom
                  square
                  icon="Plus"
                  size="small"
                  type="button"
                  @click="() => { $refs.pinImageInput.click() }"
                />
              </div>
              <input
                ref="pinImageInput"
                class="hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="pinImage = $event.target.files?.[0] || null"
              />
              <span v-if="pinImage" class="text-xs text-center font-medium text-slate-500">
                Arquivo: {{ pinImage.name }}
              </span>
            </div>

          </div>

          <!-- Rodapé com ações -->
          <footer class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 border-t border-slate-200/20 px-2 sm:px-5 py-4 sm:py-6 mt-2 w-full">
            <ButtonCustom
              v-if="isEditing"
              text="Excluir"
              icon="Trash2"
              type="button"
              class="w-full sm:w-auto"
              @click="emit('delete')"
            />
            <ButtonCustom
              :text="saving ? 'Salvando…' : 'Salvar'"
              icon="Save"
              type="submit"
              class="w-full sm:w-auto"
              :disabled="saving || (isPortal && !targetMapId)"
            />
          </footer>

        </form>
  </WindowModal>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}
</style>
