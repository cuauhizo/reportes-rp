<script setup>
import { computed } from 'vue'

const props = defineProps({
  milestones: { type: String, default: '' },
  roadmap: { type: String, default: '' },
})

const roadmapList = computed(() => {
  if (!props.roadmap) return []
  return props.roadmap.split('\n').filter((line) => line.trim() !== '')
})
</script>

<template>
  <div class="grid grid-cols-1 gap-12 text-white">
    <div class="flex flex-col justify-center">
      <h2 class="text-2xl font-black mb-6 uppercase tracking-tighter text-red-600">
        Hitos del Periodo
      </h2>
      <p class="text-zinc-300 text-sm leading-relaxed italic border-l-4 border-zinc-700 pl-6 py-2">
        {{ milestones || 'Sin hitos registrados para este periodo.' }}
      </p>
    </div>

    <div>
      <div class="bg-red-700 p-8 rounded-2xl shadow-2xl text-white">
        <h4
          class="font-black text-xl mb-6 uppercase tracking-tighter border-b border-white/20 pb-4"
        >
          Próximos Pasos
        </h4>
        <ul class="space-y-3 text-sm font-medium">
          <li v-for="(step, index) in roadmapList" :key="index" class="flex items-start">
            <span class="mr-2 opacity-70">●</span>
            {{ step }}
          </li>
          <li v-if="roadmapList.length === 0" class="italic opacity-50">No hay pasos definidos.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
