<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { justFinishedIntro } from './composables/useIntroState';
import GlobalToast from './components/GlobalToast.vue';

const route = useRoute();

const skipIntroStorage = localStorage.getItem('skipIntro') === 'true';
// Inicia true se for pra pular a intro ou se a URL já indicar rota diferente da raiz na largada
const introFinished = ref(skipIntroStorage || window.location.pathname !== '/');

const onIntroEnd = () => {
  introFinished.value = true;
  justFinishedIntro.value = true;
  
  // Limpa o flag da animação depois dela rodar (1.5s é o suficiente)
  setTimeout(() => {
    justFinishedIntro.value = false;
  }, 2000);
};

watch(() => route.path, (newPath) => {
  if (newPath !== '/') {
    introFinished.value = true;
  }
}, { immediate: true });
</script>

<template>
  <Transition name="fade">
    <div v-if="!introFinished" class="intro-container">
      <video 
        autoplay 
        muted 
        class="intro-video"
        @ended="onIntroEnd"
      >
        <source src="/Intro.mp4" type="video/mp4" />
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  </Transition>
  <RouterView v-if="introFinished" />
  <GlobalToast />
</template>

<style scoped>
.intro-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.intro-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Reduz levemente o tamanho máximo para dar um respiro (opcional, 90%) */
  max-width: 90vw;
  max-height: 90dvh;
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>
