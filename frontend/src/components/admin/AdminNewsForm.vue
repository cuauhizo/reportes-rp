<script setup>
import { ref, watch } from 'vue'
import { TIERS, SENTIMENTS, MEDIA_TYPES } from '../../utils/constants'

const props = defineProps(['editingItem', 'clientId'])
const emit = defineEmits(['saved', 'cancel', 'notify'])
const apiUrl = import.meta.env.VITE_API_URL
const loading = ref(false)
const fieldErrors = ref({})

// Modelo inicial
const defaultForm = {
  publication_date: new Date().toISOString().split('T')[0],
  media_name: '',
  reporter: '',
  title: '',
  reach: 0,
  ave_value: 0,
  tier: 'Tier 1',
  sentiment: 'Positivo',
  media_type: 'Nota',
  key_message: '',
}

const form = ref({ ...defaultForm })

// Si estamos editando, cargamos los datos
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      form.value = { ...newItem, publication_date: newItem.publication_date.split('T')[0] }
    } else {
      form.value = { ...defaultForm }
    }
  },
  { immediate: true },
)

const validate = () => {
  fieldErrors.value = {}
  let isValid = true
  if (!form.value.media_name) {
    fieldErrors.value.media_name = true
    isValid = false
  }
  if (!form.value.title) {
    fieldErrors.value.title = true
    isValid = false
  }
  return isValid
}

const submit = async () => {
  if (!validate()) {
    emit('notify', 'Corrige los errores', 'error')
    return
  }
  loading.value = true

  try {
    const isEditing = !!props.editingItem
    const url = isEditing ? `${apiUrl}/news/${props.editingItem.id}` : `${apiUrl}/news`
    const method = isEditing ? 'PUT' : 'POST'
    const body = { ...form.value, clientId: props.clientId }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      emit('notify', isEditing ? 'Registro actualizado' : 'Registro creado', 'success')
      form.value = { ...defaultForm } // Limpiar
      emit('saved') // Avisar al padre que recargue la tabla
    } else {
      emit('notify', 'Error al guardar', 'error')
    }
  } catch (e) {
    emit('notify', 'Error de conexión', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-zinc-50 p-8 animate-fade-in">
    <div
      v-if="editingItem"
      class="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 flex justify-between rounded"
    >
      <p class="text-blue-800 font-bold">✏️ Editando registro #{{ editingItem.id }}</p>
      <button
        @click="emit('cancel')"
        class="text-xs font-bold text-blue-600 uppercase border border-blue-200 px-3 py-1 rounded bg-white"
      >
        Cancelar
      </button>
    </div>

    <form
      @submit.prevent="submit"
      class="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 space-y-6 max-w-5xl mx-auto"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Fecha</label
          ><input
            v-model="form.publication_date"
            type="date"
            class="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Tema</label
          ><input
            v-model="form.key_message"
            type="text"
            class="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Medio</label
          ><input
            v-model="form.media_name"
            type="text"
            :class="[
              'w-full border rounded p-2 outline-none',
              fieldErrors.media_name ? 'border-red-500 bg-red-50' : '',
            ]"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Género</label
          ><select v-model="form.media_type" class="w-full border rounded p-2">
            <option v-for="type in MEDIA_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Reportero</label
          ><input v-model="form.reporter" type="text" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Sentimiento</label
          ><select v-model="form.sentiment" class="w-full border rounded p-2">
            <option v-for="s in SENTIMENTS" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block font-bold text-[10px] uppercase text-zinc-500 mb-1">Testigo</label
        ><input
          v-model="form.title"
          type="text"
          :class="[
            'w-full border rounded p-2 outline-none',
            fieldErrors.title ? 'border-red-500 bg-red-50' : '',
          ]"
        />
      </div>
      <div class="grid grid-cols-3 gap-6 bg-zinc-50 p-4 rounded border">
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-400 mb-1">Alcance</label>
          <input v-model="form.reach" type="number" class="w-full border rounded p-2 text-right" />
          <p v-if="form.reach" class="text-[10px] text-emerald-600 text-right font-mono mt-1">
            {{ new Intl.NumberFormat('es-MX').format(form.reach) }} personas
          </p>
        </div>
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-400 mb-1">ROI</label>
          <input
            v-model="form.ave_value"
            type="number"
            class="w-full border rounded p-2 text-right"
          />
          <p v-if="form.ave_value" class="text-[10px] text-emerald-600 text-right font-mono mt-1">
            {{
              new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                form.ave_value,
              )
            }}
          </p>
        </div>
        <div>
          <label class="block font-bold text-[10px] uppercase text-zinc-400 mb-1">Tier</label
          ><select v-model="form.tier" class="w-full border rounded p-2">
            <option v-for="t in TIERS" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <div class="pt-4 border-t flex justify-end">
        <button
          type="submit"
          :disabled="loading"
          class="bg-emerald-700 text-white font-bold py-3 px-8 rounded hover:bg-emerald-800 uppercase text-xs"
        >
          {{ loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>
