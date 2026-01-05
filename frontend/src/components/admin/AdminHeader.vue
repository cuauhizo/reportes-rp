<script setup>
import { useRouter } from 'vue-router'

const props = defineProps(['clients', 'selectedClientId'])
const emit = defineEmits(['update:selectedClientId'])
const router = useRouter()

// Cuando el select cambia, avisamos al padre (AdminView)
const handleChange = (e) => {
  emit('update:selectedClientId', Number(e.target.value))
}
</script>

<template>
  <div class="bg-emerald-900 px-6 py-4 flex justify-between items-center">
    <div class="flex items-center gap-4">
      <h2 class="text-lg font-bold text-white uppercase">Gestión</h2>
      <select
        :value="selectedClientId"
        @change="handleChange"
        class="bg-emerald-800 text-white border border-emerald-700 rounded px-3 py-1 text-xs font-bold focus:outline-none cursor-pointer"
      >
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>
    <button
      @click="router.push('/')"
      class="text-emerald-100 hover:text-white font-bold uppercase tracking-widest border border-emerald-700 px-3 py-1 rounded transition-colors"
    >
      Ver Dashboard
    </button>
  </div>
</template>
