<script setup>
import { useRouter } from 'vue-router'
// Importamos iconos
import { LogOut, LayoutDashboard, Building2 } from 'lucide-vue-next'

const props = defineProps(['clients', 'selectedClientId'])
const emit = defineEmits(['update:selectedClientId'])
const router = useRouter()

const handleChange = (e) => {
  emit('update:selectedClientId', Number(e.target.value))
}
</script>

<template>
  <div class="bg-gradient-to-r from-black via-zinc-900 to-red-900 text-white px-8 py-6 shadow-2xl">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-4">
        <div class="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <Building2 class="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p class="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Panel de Control
          </p>
          <h2 class="text-2xl font-black text-white tracking-tight">GESTIÓN DE DATOS</h2>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative group">
          <select
            :value="selectedClientId"
            @change="handleChange"
            class="appearance-none bg-zinc-900 border border-zinc-700 text-white pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none cursor-pointer transition-all hover:bg-zinc-800"
          >
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <div class="absolute right-3 top-3 pointer-events-none text-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        <button
          @click="router.push('/')"
          class="flex items-center gap-2 bg-white text-zinc-900 font-bold px-4 py-2.5 rounded-xl text-xs uppercase hover:bg-zinc-200 transition-colors shadow-lg"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  </div>
</template>
