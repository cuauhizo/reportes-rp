<script setup>
defineProps({
  impacts: {
    type: [Number, String],
    default: 0,
  },
  reach: {
    type: String,
    default: '0',
  },
  ave: {
    type: String,
    default: '$0',
  },
  tier1Percentage: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <section class="no-break">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600">
        <p class="text-zinc-500 font-bold text-xs uppercase">Impactos</p>
        <div class="text-4xl font-black mt-2 text-zinc-800">
          {{ impacts }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-zinc-800">
        <p class="text-zinc-500 font-bold text-xs uppercase">Alcance (OTS)</p>
        <div class="text-4xl font-black mt-2 text-zinc-800">
          {{ reach }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-zinc-400">
        <p class="text-zinc-500 font-bold text-xs uppercase">Valor (AVE)</p>
        <div class="text-4xl font-black text-red-700 mt-2">
          {{ ave }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-zinc-900">
        <p class="text-zinc-500 font-bold text-xs uppercase">% Medios Tier 1</p>
        <div class="text-4xl font-black text-zinc-800 mt-2">{{ tier1Percentage }}%</div>

        <div class="w-full bg-zinc-100 h-2 mt-2 rounded-full overflow-hidden">
          <div
            class="bg-red-600 h-full transition-all duration-500 ease-out"
            :style="{ width: tier1Percentage + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>
