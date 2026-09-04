<template>
  <div class="h-screen w-full relative overflow-hidden bg-[#f4f4f4] flex items-center justify-center">
    <!-- Imagem 404.webp cobrindo a tela toda -->
    <img src="/404.webp" alt="Página não encontrada" class="absolute inset-0 w-full h-full object-cover" />
    
    <!-- Botão padronizado para voltar à página principal, posicionado mais acima -->
    <div class="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
      <ButtonCustom text="Voltar para o Mapa" icon="ArrowLeft" @click="$router.push('/')" />
    </div>
  </div>
</template>

<script setup>
import ButtonCustom from "../components/ButtonCustom.vue";
</script>
