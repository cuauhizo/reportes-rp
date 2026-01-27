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
    <div>
      <div class="bg-red-700 p-8 rounded-2xl shadow-2xl text-white lg:mt-16">
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
