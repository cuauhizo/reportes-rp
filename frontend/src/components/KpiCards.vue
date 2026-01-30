<script setup>
import { computed } from 'vue'
import { Layers, Activity, DollarSign, Award, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

const props = defineProps({
  impacts: { type: Number, default: 0 },
  goal: { type: Number, default: 0 },
  reach: { type: [Number, String], default: 0 },
  ave: { type: Number, default: 0 },
  tier1Percentage: { type: Number, default: 0 },
})

// --- FUNCIÓN DE FORMATEO INTELIGENTE ---
const formatSmartNumber = (num, isCurrency = false) => {
  // 1. Convertimos a número por si viene como string "500"
  const n = Number(num)

  // 2. Si no es un número válido (NaN) o es 0, devolvemos el fallback
  if (isNaN(n) || n === 0) return isCurrency ? '$0' : '0'

  let value = n // Usamos 'n' que ya es seguro
  let suffix = ''

  // Lógica para Millones (M)
  if (n >= 1000000) {
    value = n / 1000000
    suffix = 'M'
  }
  // Lógica para Miles (k)
  else if (n >= 1000) {
    value = n / 1000
    suffix = 'k'
  }

  // Formateamos el número base (ej: 1.2 o 11.5)
  // Usamos 'maximumFractionDigits: 1' para que no llene de decimales (ej: 1.2M en vez de 1.2345M)
  // Pero si es entero exacto, no muestra decimales.
  const formattedValue = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value)

  // Si es moneda agregamos el signo $, si no, solo el sufijo
  return isCurrency ? `$${formattedValue}${suffix}` : `${formattedValue}${suffix}`
}

// Calculamos el porcentaje de cumplimiento
const goalProgress = computed(() => {
  if (!props.goal || props.goal === 0) return 0
  return Math.round((props.impacts / props.goal) * 100)
})

// Computed properties para usar en el template
const formattedReach = computed(() => formatSmartNumber(props.reach))
const formattedAve = computed(() => formatSmartNumber(props.ave, true)) // true = es dinero
const formattedImpacts = computed(() => props.impacts.toLocaleString()) // Los impactos suelen ser pocos, dejamos formato normal
</script>

<template>
  <section class="no-break">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Impactos</p>
          <h3 class="text-4xl font-black text-zinc-900 tracking-tight">{{ formattedImpacts }}</h3>

          <div v-if="goal > 0" class="mt-2 flex items-center text-xs font-bold">
            <span
              :class="goalProgress >= 100 ? 'text-emerald-600' : 'text-amber-600'"
              class="bg-zinc-100 px-1.5 py-0.5 rounded mr-1"
            >
              {{ goalProgress }}%
            </span>
            <span class="text-zinc-400 font-medium">vs meta ({{ goal }})</span>
          </div>

          <div v-else class="mt-2 flex items-center text-xs font-medium text-emerald-600">
            <ArrowUpRight class="w-3 h-3 mr-1" />
            <span>Notas en periodo</span>
          </div>
        </div>

        <div class="h-1 w-full bg-zinc-100 mt-4 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-1000"
            :class="goalProgress >= 100 ? 'bg-emerald-500' : 'bg-red-600'"
            :style="`width: ${Math.min(goalProgress, 100)}%`"
          ></div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-zinc-800">
        <p class="text-zinc-500 font-bold text-xs uppercase">Alcance (OTS)</p>
        <div class="text-4xl font-black mt-2 text-zinc-800">
          {{ formattedReach }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-zinc-400">
        <p class="text-zinc-500 font-bold text-xs uppercase">Valor (AVE)</p>
        <div class="text-4xl font-black text-red-700 mt-2">
          {{ formattedAve }}
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600">
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
