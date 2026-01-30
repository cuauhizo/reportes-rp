<script setup>
import { ExternalLink, User, FileText } from 'lucide-vue-next' // Agrega User
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const apiUrl = import.meta.env.VITE_API_URL.replace('/api', '') // Base URL para las imágenes
// Esto asume que tu API es .../api. Las imágenes están en .../uploads.
// Ajusta según tu dominio real.

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
            <div class="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-600">
              <p class="text-sm font-bold text-zinc-900 mb-2 italic">"{{ item.title }}"</p>
              <div v-if="item.link" class="mb-3">
                <a
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline uppercase tracking-wide gap-1"
                >
                  <ExternalLink class="w-3 h-3" />
                  Ver Nota Original
                </a>
              </div>
              <div v-if="item.spokesperson" class="flex items-center gap-2 mb-3">
                <div
                  class="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded text-[10px] font-bold uppercase text-zinc-600"
                >
                  <User class="w-3 h-3" />
                  <span>Vocero: {{ item.spokesperson }}</span>
                </div>
              </div>
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
                      'text-gray-600': item.sentiment === 'Informativo',
                      'text-red-600': item.sentiment === 'Negativo',
                    }"
                  >
                    {{ item.sentiment }}
                  </span>
                </div>
              </div>
              <div
                v-if="item.file_url && item.file_url.match(/\.(jpeg|jpg|gif|png)$/i)"
                class="mt-4 rounded-lg overflow-hidden border border-zinc-100"
              >
                <img
                  :src="`${apiUrl}${item.file_url}`"
                  alt="Evidencia"
                  class="w-full h-40 object-cover hover:h-auto transition-all cursor-zoom-in"
                />
              </div>

              <div v-else-if="item.file_url" class="mt-4">
                <a
                  :href="`${apiUrl}${item.file_url}`"
                  target="_blank"
                  class="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <FileText class="w-4 h-4" /> Ver Documento PDF Adjunto
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
