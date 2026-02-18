<template>
  <AppLayout>
    <div class="estudiante-form-page">
      <!-- Título -->
      <h1 class="text-3xl font-bold mb-4">
        {{ isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante' }}
      </h1>

      <!-- Alertas -->
      <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

      <!-- Formulario -->
      <div class="card" style="max-width: 600px;">
        <div class="card-body">
          <form @submit.prevent="handleSubmit">
            <!-- Seleccionar Usuario -->
            <div class="form-group">
              <label for="usuarioId" class="form-label">Usuario *</label>
              <select
                id="usuarioId"
                v-model.number="form.usuarioId"
                class="form-select"
                :class="{ error: errors.usuarioId }"
                :disabled="loadingUsuarios || isEditing"
                required
              >
                <option value="">Selecciona un usuario</option>
                <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                  {{ usuario.nombre }} ({{ usuario.correo }})
                </option>
              </select>
              <span v-if="errors.usuarioId" class="form-error">{{ errors.usuarioId }}</span>
              <small class="text-sm" style="color: var(--gray-500);">
                Solo se muestran usuarios con rol ESTUDIANTE
              </small>
            </div>

            <!-- Código -->
            <div class="form-group">
              <label for="codigo" class="form-label">Código del Estudiante *</label>
              <input
                id="codigo"
                v-model="form.codigo"
                type="text"
                class="form-input"
                :class="{ error: errors.codigo }"
                placeholder="EST-2024-001"
                required
              />
              <span v-if="errors.codigo" class="form-error">{{ errors.codigo }}</span>
            </div>

            <!-- Activo -->
            <div class="form-group">
              <label class="flex items-center gap-2">
                <input
                  v-model="form.activo"
                  type="checkbox"
                  style="width: auto;"
                />
                <span class="form-label" style="margin: 0;">Estudiante activo</span>
              </label>
            </div>

            <!-- Botones -->
            <div class="flex gap-2">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <template v-if="loading">
                  <div class="loader loader-sm" style="border-color: white transparent white transparent;"></div>
                  Guardando...
                </template>
                <template v-else>
                  {{ isEditing ? 'Actualizar' : 'Crear' }} Estudiante
                </template>
              </button>
              <router-link to="/estudiantes" class="btn btn-secondary">
                Cancelar
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { estudiantesService, usuariosService } from '@/api'
import AppLayout from '@/components/AppLayout.vue'
import Alert from '@/components/Alert.vue'

export default {
  name: 'EstudianteFormPage',
  components: {
    AppLayout,
    Alert
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(false)
    const loadingUsuarios = ref(true)
    const alert = ref({ show: false, type: 'success', message: '' })

    const isEditing = computed(() => !!route.params.id)

    const form = ref({
      usuarioId: '',
      codigo: '',
      activo: true
    })

    const errors = ref({})
    const usuarios = ref([])

    // Cargar usuarios
    const cargarUsuarios = async () => {
      try {
        loadingUsuarios.value = true
        const allUsuarios = await usuariosService.getAll()
        // Filtrar solo usuarios con rol ESTUDIANTE
        usuarios.value = allUsuarios.filter(u => u.rol === 'ESTUDIANTE')
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
      } finally {
        loadingUsuarios.value = false
      }
    }

    // Cargar datos del estudiante si está editando
    const cargarEstudiante = async () => {
      try {
        loading.value = true
        const estudiante = await estudiantesService.getById(route.params.id)
        form.value = {
          usuarioId: estudiante.usuarioId,
          codigo: estudiante.codigo,
          activo: estudiante.activo
        }
      } catch (error) {
        alert.value = { show: true, type: 'error', message: 'Error al cargar estudiante' }
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    // Validar formulario
    const validarFormulario = () => {
      errors.value = {}
      let isValid = true

      if (!form.value.usuarioId) {
        errors.value.usuarioId = 'Debe seleccionar un usuario'
        isValid = false
      }

      if (!form.value.codigo || form.value.codigo.trim().length < 3) {
        errors.value.codigo = 'El código debe tener al menos 3 caracteres'
        isValid = false
      }

      return isValid
    }

    // Enviar formulario
    const handleSubmit = async () => {
      if (!validarFormulario()) {
        return
      }

      try {
        loading.value = true

        if (isEditing.value) {
          // Actualizar
          await estudiantesService.update(route.params.id, {
            codigo: form.value.codigo,
            activo: form.value.activo
          })
          alert.value = { show: true, type: 'success', message: 'Estudiante actualizado correctamente' }
        } else {
          // Crear
          await estudiantesService.create(form.value)
          alert.value = { show: true, type: 'success', message: 'Estudiante creado correctamente' }
        }

        // Redirigir después de 1 segundo
        setTimeout(() => {
          router.push('/estudiantes')
        }, 1000)
      } catch (error) {
        alert.value = { show: true, type: 'error', message: 'Error al guardar estudiante' }
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      cargarUsuarios()
      if (isEditing.value) {
        cargarEstudiante()
      }
    })

    return {
      loading,
      loadingUsuarios,
      alert,
      isEditing,
      form,
      errors,
      usuarios,
      handleSubmit
    }
  }
}
</script>
