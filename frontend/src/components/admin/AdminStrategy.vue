<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['clientId'])
const emit = defineEmits(['notify'])
const apiUrl = import.meta.env.VITE_API_URL
const loading = ref(false)
const currentReportId = ref(null)

const form = ref({
  swot_strengths: '',
  swot_opportunities: '',
  swot_weaknesses: '',
  swot_threats: '',
  milestones: '',
  roadmap: '',
})

// Cargar datos cuando cambia el cliente
const loadStrategy = async () => {
  try {
    const res = await fetch(`${apiUrl}/report?clientId=${props.clientId}&label=Anual`)
    const data = await res.json()
    if (data.meta) currentReportId.value = data.meta.id

    form.value = {
      swot_strengths: data.meta.swot_strengths || '',
      swot_opportunities: data.meta.swot_opportunities || '',
      swot_weaknesses: data.meta.swot_weaknesses || '',
      swot_threats: data.meta.swot_threats || '',
      milestones: data.meta.milestones || '',
      roadmap: data.meta.roadmap || '',
    }
  } catch (e) {
    console.error(e)
  }
}

watch(() => props.clientId, loadStrategy, { immediate: true })

const submit = async () => {
  if (!currentReportId.value) {
    emit('notify', 'No hay reporte activo', 'error')
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/report/${currentReportId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (res.ok) emit('notify', 'Estrategia actualizada', 'success')
    else emit('notify', 'Error al guardar', 'error')
  } catch (e) {
    emit('notify', 'Error de conexión', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-8 animate-fade-in">
    <form @submit.prevent="submit">
      <h3 class="font-black text-lg mb-4 border-l-4 border-emerald-600 pl-3 uppercase">
        Matriz FODA
      </h3>
      <div class="grid grid-cols-2 gap-6 mb-8">
        <textarea
          v-model="form.swot_strengths"
          placeholder="Fortalezas"
          rows="3"
          class="w-full bg-zinc-50 border p-3 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        ></textarea>
        <textarea
          v-model="form.swot_opportunities"
          placeholder="Oportunidades"
          rows="3"
          class="w-full bg-zinc-50 border p-3 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <textarea
          v-model="form.swot_weaknesses"
          placeholder="Debilidades"
          rows="3"
          class="w-full bg-zinc-50 border p-3 rounded text-sm outline-none focus:ring-2 focus:ring-amber-500"
        ></textarea>
        <textarea
          v-model="form.swot_threats"
          placeholder="Amenazas"
          rows="3"
          class="w-full bg-zinc-50 border p-3 rounded text-sm outline-none focus:ring-2 focus:ring-red-500"
        ></textarea>
      </div>
      <h3 class="font-black text-lg mb-4 border-l-4 border-zinc-800 pl-3 uppercase">Contexto</h3>
      <div class="space-y-6">
        <textarea
          v-model="form.milestones"
          placeholder="Hito Principal"
          rows="2"
          class="w-full bg-zinc-50 border p-3 rounded text-sm"
        ></textarea>
        <textarea
          v-model="form.roadmap"
          placeholder="Próximos Pasos"
          rows="4"
          class="w-full bg-zinc-50 border p-3 rounded text-sm"
        ></textarea>
      </div>
      <button
        type="submit"
        class="mt-8 w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-black uppercase text-xs"
      >
        Actualizar Estrategia
      </button>
    </form>
  </div>
</template>
