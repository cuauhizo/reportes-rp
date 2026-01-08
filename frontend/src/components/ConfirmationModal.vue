<script setup>
import { AlertTriangle, X } from 'lucide-vue-next'
import { onMounted, onUnmounted } from 'vue'

defineProps({
  show: Boolean,
  title: { type: String, default: '¿Estás seguro?' },
  message: { type: String, default: 'Esta acción no se puede deshacer.' },
  confirmText: { type: String, default: 'Eliminar' },
  cancelText: { type: String, default: 'Cancelar' },
  type: { type: String, default: 'danger' }, // 'danger' o 'info'
})

const emit = defineEmits(['close', 'confirm'])

const closeOnEsc = (e) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', closeOnEsc))
onUnmounted(() => window.removeEventListener('keydown', closeOnEsc))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>

        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100"
        >
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="p-8 text-center">
            <div
              class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6"
            >
              <AlertTriangle class="w-8 h-8 text-red-600" />
            </div>

            <h3 class="text-xl font-black text-zinc-900 mb-2">{{ title }}</h3>
            <p class="text-zinc-500 text-sm leading-relaxed mb-8">
              {{ message }}
            </p>

            <div class="flex gap-3 justify-center">
              <button
                @click="emit('close')"
                class="px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-colors"
              >
                {{ cancelText }}
              </button>

              <button
                @click="emit('confirm')"
                class="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition-transform active:scale-95"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
