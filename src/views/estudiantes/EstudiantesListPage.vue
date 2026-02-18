<template>
  <AppLayout>
    <div class="estudiantes-list-page">
      <!-- Header con título y botón -->
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Estudiantes</h1>
        <router-link to="/estudiantes/nuevo" class="btn btn-primary">
          ➕ Nuevo Estudiante
        </router-link>
      </div>

      <!-- Alertas -->
      <Alert v-if="alert.show" :type="alert.type" :message="alert.message" @close="alert.show = false" />

      <!-- Cargando -->
      <LoadingSpinner v-if="loading" message="Cargando estudiantes..." />

      <!-- Tabla de estudiantes -->
      <div v-else class="card">
        <div class="card-body">
          <div v-if="estudiantes.length === 0" class="text-center p-4">
            <p class="text-gray-500">No hay estudiantes registrados</p>
            <router-link to="/estudiantes/nuevo" class="btn btn-primary mt-3">
              Crear primer estudiante
            </router-link>
          </div>

          <div v-else class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>QR Token</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="estudiante in estudiantes" :key="estudiante.id">
                  <td>{{ estudiante.id }}</td>
                  <td><strong>{{ estudiante.codigo }}</strong></td>
                  <td>{{ estudiante.nombre }}</td>
                  <td>
                    <code class="text-sm">{{ estudiante.qrToken?.substring(0, 12) }}...</code>
                  </td>
                  <td>
                    <span :class="estudiante.activo ? 'badge badge-success' : 'badge badge-secondary'">
                      {{ estudiante.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <router-link
                        :to="`/estudiantes/${estudiante.id}`"
                        class="btn btn-sm btn-secondary"
                        title="Ver detalle"
                      >
                        👁️
                      </router-link>
                      <router-link
                        :to="`/estudiantes/${estudiante.id}/editar`"
                        class="btn btn-sm btn-primary"
                        title="Editar"
                      >
                        ✏️
                      </router-link>
                      <button
                        @click="abrirModalRegenerarQR(estudiante)"
                        class="btn btn-sm"
                        style="background: #3B82F6; color: white;"
                        title="Regenerar QR"
                      >
                        🔄
                      </button>
                      <button
                        @click="abrirModalEliminar(estudiante)"
                        class="btn btn-sm btn-danger"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal confirmar eliminar -->
      <Modal
        :show="showModalEliminar"
        title="Confirmar Eliminación"
        @close="showModalEliminar = false"
        @confirm="confirmarEliminar"
      >
        <p>¿Estás seguro de que deseas eliminar al estudiante <strong>{{ estudianteSeleccionado?.nombre }}</strong>?</p>
        <p class="text-sm text-danger mt-2">Esta acción no se puede deshacer.</p>
      </Modal>

      <!-- Modal regenerar QR -->
      <Modal
        :show="showModalRegenerarQR"
        title="Regenerar Código QR"
        @close="showModalRegenerarQR = false"
        @confirm="confirmarRegenerarQR"
      >
        <p>¿Deseas regenerar el código QR del estudiante <strong>{{ estudianteSeleccionado?.nombre }}</strong>?</p>
        <p class="text-sm mt-2" style="color: var(--warning-color);">
          El código QR anterior dejará de funcionar.
        </p>
      </Modal>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { estudiantesService } from '@/api'
import AppLayout from '@/components/AppLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'
import Modal from '@/components/Modal.vue'

export default {
  name: 'EstudiantesListPage',
  components: {
    AppLayout,
    LoadingSpinner,
    Alert,
    Modal
  },
  setup() {
    const loading = ref(true)
    const estudiantes = ref([])
    const alert = ref({ show: false, type: 'success', message: '' })

    const showModalEliminar = ref(false)
    const showModalRegenerarQR = ref(false)
    const estudianteSeleccionado = ref(null)

    // Mostrar alerta
    const mostrarAlerta = (type, message) => {
      alert.value = { show: true, type, message }
      setTimeout(() => {
        alert.value.show = false
      }, 5000)
    }

    // Cargar estudiantes
    const cargarEstudiantes = async () => {
      try {
        loading.value = true
        estudiantes.value = await estudiantesService.getAll()
      } catch (error) {
        mostrarAlerta('error', 'Error al cargar estudiantes')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    // Abrir modal de eliminar
    const abrirModalEliminar = (estudiante) => {
      estudianteSeleccionado.value = estudiante
      showModalEliminar.value = true
    }

    // Confirmar eliminación
    const confirmarEliminar = async () => {
      try {
        await estudiantesService.delete(estudianteSeleccionado.value.id)
        mostrarAlerta('success', 'Estudiante eliminado correctamente')
        showModalEliminar.value = false
        cargarEstudiantes()
      } catch (error) {
        mostrarAlerta('error', 'Error al eliminar estudiante')
        console.error(error)
      }
    }

    // Abrir modal regenerar QR
    const abrirModalRegenerarQR = (estudiante) => {
      estudianteSeleccionado.value = estudiante
      showModalRegenerarQR.value = true
    }

    // Confirmar regenerar QR
    const confirmarRegenerarQR = async () => {
      try {
        await estudiantesService.regenerarQR(estudianteSeleccionado.value.id)
        mostrarAlerta('success', 'Código QR regenerado correctamente')
        showModalRegenerarQR.value = false
        cargarEstudiantes()
      } catch (error) {
        mostrarAlerta('error', 'Error al regenerar QR')
        console.error(error)
      }
    }

    onMounted(() => {
      cargarEstudiantes()
    })

    return {
      loading,
      estudiantes,
      alert,
      showModalEliminar,
      showModalRegenerarQR,
      estudianteSeleccionado,
      abrirModalEliminar,
      confirmarEliminar,
      abrirModalRegenerarQR,
      confirmarRegenerarQR
    }
  }
}
</script>

<style scoped>
code {
  background: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}
</style>
