<script setup>
defineProps({
  strengths: { type: String, default: 'Sin definir' },
  opportunities: { type: String, default: 'Sin definir' },
  weaknesses: { type: String, default: 'Sin definir' },
  threats: { type: String, default: 'Sin definir' },
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
      <h4 class="text-emerald-500 font-bold mb-3 uppercase text-xs tracking-wider">Fortalezas</h4>
      <p class="text-sm text-zinc-400 leading-relaxed">{{ strengths }}</p>
    </div>

    <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
      <h4 class="text-blue-500 font-bold mb-3 uppercase text-xs tracking-wider">Oportunidades</h4>
      <p class="text-sm text-zinc-400 leading-relaxed">{{ opportunities }}</p>
    </div>

    <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
      <h4 class="text-amber-500 font-bold mb-3 uppercase text-xs tracking-wider">Debilidades</h4>
      <p class="text-sm text-zinc-400 leading-relaxed">{{ weaknesses }}</p>
    </div>

    <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
      <h4 class="text-red-500 font-bold mb-3 uppercase text-xs tracking-wider">Amenazas</h4>
      <p class="text-sm text-zinc-400 leading-relaxed">{{ threats }}</p>
    </div>
  </div>
</template>
