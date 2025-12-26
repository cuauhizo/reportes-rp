<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}
</script>

<template>
  <section class="mt-12">
    <div class="relative max-w-4xl mx-auto">
      <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-200"></div>

      <div v-for="(item, index) in items" :key="item.id" class="relative mb-8 group">
        <div
          class="absolute left-4 md:left-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white -translate-x-1.5 md:-translate-x-2 z-10"
        ></div>

        <div class="flex flex-col md:flex-row items-center w-full">
          <div class="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 md:text-right mb-2 md:mb-0">
            <span class="text-red-600 font-bold text-xs uppercase tracking-widest block">
              {{ formatDate(item.publication_date) }}
            </span>
            <h4 class="text-lg font-black text-zinc-800 uppercase">{{ item.media_name }}</h4>
          </div>

          <div class="w-full md:w-1/2 pl-12">
            <div
              class="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-600 transition-transform hover:-translate-y-1"
            >
              <p class="text-sm font-bold text-zinc-900 mb-2 italic">"{{ item.title }}"</p>

              <div
                class="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase border-t pt-2 text-zinc-500 mt-3"
              >
                <div>
                  Msg: <span class="text-red-600">{{ item.key_message }}</span>
                </div>
                <div>
                  Tono:
                  <span
                    :class="{
                      'text-green-600': item.sentiment === 'Positivo',
                      'text-gray-600': item.sentiment === 'Neutro',
                      'text-red-600': item.sentiment === 'Negativo',
                    }"
                  >
                    {{ item.sentiment }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
