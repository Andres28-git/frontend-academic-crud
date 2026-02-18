<template>
  <AppLayout>
    <div class="asistencias-list-page">
      <h1 class="text-3xl font-bold mb-4">Asistencias</h1>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="grid grid-cols-4">
            <div class="form-group">
              <label class="form-label">Fecha Desde</label>
              <input
                v-model="filtros.fechaDesde"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Hasta</label>
              <input
                v-model="filtros.fechaHasta"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select v-model="filtros.estado" class="form-select">
                <option value="">Todos</option>
                <option value="PRESENTE">Presente</option>
                <option value="TARDANZA">Tardanza</option>
                <option value="FALTA">Falta</option>
                <option value="JUSTIFICADA">Justificada</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">&nbsp;</label>
              <button @click="aplicarFiltros" class="btn btn-primary" style="width: 100%;">
                🔍 Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cargando -->
      <LoadingSpinner v-if="loading" message="Cargando asistencias..." />

      <!-- Tabla de asistencias -->
      <div v-else class="card">
        <div class="card-body">
          <div v-if="asistencias.length === 0" class="text-center p-4">
            <p class="text-gray-500">No se encontraron asistencias</p>
          </div>

          <div v-else class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estudiante</th>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Origen</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="asistencia in asistencias" :key="asistencia.id">
                  <td>{{ formatFecha(asistencia.fecha) }}</td>
                  <td>{{ formatHora(asistencia.hora) }}</td>
                  <td>{{ asistencia.nombre }}</td>
                  <td><strong>{{ asistencia.codigo }}</strong></td>
                  <td>
                    <span :class="getEstadoBadgeClass(asistencia.estado)">
                      {{ asistencia.estado }}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-secondary">{{ asistencia.origen }}</span>
                  </td>
                  <td>{{ asistencia.observacion || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { asistenciasService } from '@/api'
import AppLayout from '@/components/AppLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'AsistenciasListPage',
  components: {
    AppLayout,
    LoadingSpinner
  },
  setup() {
    const loading = ref(true)
    const asistencias = ref([])

    const filtros = ref({
      fechaDesde: '',
      fechaHasta: '',
      estado: ''
    })

    const formatFecha = (fecha) => {
      if (!fecha) return ''
      return new Date(fecha).toLocaleDateString('es-ES')
    }

    const formatHora = (hora) => {
      if (!hora) return ''
      return hora.substring(0, 5)
    }

    const getEstadoBadgeClass = (estado) => {
      const classes = {
        'PRESENTE': 'badge badge-success',
        'TARDANZA': 'badge badge-warning',
        'FALTA': 'badge badge-danger',
        'JUSTIFICADA': 'badge badge-info'
      }
      return classes[estado] || 'badge badge-secondary'
    }

    const cargarAsistencias = async () => {
      try {
        loading.value = true
        asistencias.value = await asistenciasService.getAll(filtros.value)
      } catch (error) {
        console.error('Error al cargar asistencias:', error)
      } finally {
        loading.value = false
      }
    }

    const aplicarFiltros = () => {
      cargarAsistencias()
    }

    onMounted(() => {
      // Cargar asistencias del último mes por defecto
      const hoy = new Date()
      const hace30Dias = new Date()
      hace30Dias.setDate(hoy.getDate() - 30)

      filtros.value.fechaDesde = hace30Dias.toISOString().split('T')[0]
      filtros.value.fechaHasta = hoy.toISOString().split('T')[0]

      cargarAsistencias()
    })

    return {
      loading,
      asistencias,
      filtros,
      formatFecha,
      formatHora,
      getEstadoBadgeClass,
      aplicarFiltros
    }
  }
}
</script>
