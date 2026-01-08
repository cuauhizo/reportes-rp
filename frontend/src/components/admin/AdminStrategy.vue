<script setup>
import { ref, watch } from 'vue'
import { Target, Flag, Map, Save, AlertCircle } from 'lucide-vue-next' // Iconos nuevos

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

// Cargar datos (Lógica existente)
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
    emit('notify', 'No hay reporte activo para este cliente', 'error')
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/report/${currentReportId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (res.ok) emit('notify', 'Estrategia actualizada correctamente', 'success')
    else emit('notify', 'Error al guardar', 'error')
  } catch (e) {
    emit('notify', 'Error de conexión', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="animate-fade-in space-y-2">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-xl font-black text-zinc-800 tracking-tight">Estrategia y Contexto</h3>
        <p class="text-sm text-zinc-500">Define los pilares estratégicos para el reporte anual.</p>
      </div>
      <button
        @click="submit"
        :disabled="loading"
        class="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95"
      >
        <Save class="w-4 h-4" />
        {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>

    <form @submit.prevent="submit" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <div class="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
          <div class="bg-red-100 p-2 rounded-lg"><Target class="w-5 h-5 text-red-600" /></div>
          <h4 class="font-bold text-lg text-zinc-800">Matriz FODA</h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase text-emerald-700">Fortalezas</label>
            <textarea
              v-model="form.swot_strengths"
              rows="4"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all placeholder-zinc-400"
              placeholder="Puntos fuertes internos..."
            ></textarea>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase text-blue-700">Oportunidades</label>
            <textarea
              v-model="form.swot_opportunities"
              rows="4"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder-zinc-400"
              placeholder="Factores externos positivos..."
            ></textarea>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase text-amber-600">Debilidades</label>
            <textarea
              v-model="form.swot_weaknesses"
              rows="4"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none transition-all placeholder-zinc-400"
              placeholder="Puntos débiles internos..."
            ></textarea>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase text-red-600">Amenazas</label>
            <textarea
              v-model="form.swot_threats"
              rows="4"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all placeholder-zinc-400"
              placeholder="Riesgos externos..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div class="flex items-center gap-2 mb-4">
            <div class="bg-zinc-100 p-2 rounded-lg"><Flag class="w-5 h-5 text-zinc-800" /></div>
            <h4 class="font-bold text-lg text-zinc-800">Hito Principal</h4>
          </div>
          <textarea
            v-model="form.milestones"
            rows="5"
            class="w-full bg-white border border-zinc-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder-zinc-400"
            placeholder="Logro más destacado del periodo..."
          ></textarea>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div class="flex items-center gap-2 mb-4">
            <div class="bg-zinc-100 p-2 rounded-lg"><Map class="w-5 h-5 text-zinc-800" /></div>
            <h4 class="font-bold text-lg text-zinc-800">Roadmap / Próximos Pasos</h4>
          </div>
          <textarea
            v-model="form.roadmap"
            rows="5"
            class="w-full bg-white border border-zinc-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder-zinc-400"
            placeholder="¿Qué sigue para la marca?"
          ></textarea>
        </div>
      </div>
    </form>
  </div>
</template>
