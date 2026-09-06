<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn } from "lucide-vue-next";
import WindowModal from "../components/WindowModal.vue";
import ButtonCustom from "../components/ButtonCustom.vue";
import { login, setToken } from "../services/api";

const router = useRouter();
const email = ref("admin@gmail.com");
const password = ref("admin123");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;

  try {
    const payload = await login(email.value, password.value);
    setToken(payload.token);
    router.push({ name: "admin-map" });
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="grid min-h-[100dvh] place-items-center bg-black/60 px-4">
    <div class="fixed inset-0 backdrop-blur-sm pointer-events-none -z-10" />

    <WindowModal :is-open="true" title="Limbus Admin" hide-close-button>
      <form
        class="flex flex-col gap-5"
        @submit.prevent="submit"
      >

      <label class="mt-6 block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Email</span>
        <input
          v-model="email"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ember focus:ring-2 focus:ring-ember/20"
          type="email"
          required
        />
      </label>

      <label class="mt-4 block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Senha</span>
        <input
          v-model="password"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ember focus:ring-2 focus:ring-ember/20"
          type="password"
          required
        />
      </label>

      <p v-if="error" class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error }}
      </p>

      <ButtonCustom
        text="Entrar"
        loadingText="Entrando…"
        :loading="loading"
        icon="LogIn"
        type="submit"
        :disabled="loading"
        class="mt-2 w-full"
      />
      </form>
    </WindowModal>
  </main>
</template>
