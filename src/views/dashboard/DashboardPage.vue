<template>
  <AppLayout>
    <div class="dashboard-page">
      <!-- Bienvenida -->
      <div class="dashboard-header mb-5">
        <h1 class="text-3xl font-bold">Bienvenido, {{ user?.nombre }}!</h1>
        <p class="text-gray-500">{{ getCurrentDate() }}</p>
      </div>

      <!-- Cargando -->
      <LoadingSpinner v-if="loading" message="Cargando datos del dashboard..." />

      <!-- Error -->
      <Alert v-else-if="error" type="error" :message="error" />

      <!-- Contenido del Dashboard -->
      <div v-else>
        <!-- Tarjetas de estadísticas -->
        <div class="grid grid-cols-4 mb-5">
          <!-- Total Estudiantes -->
          <div class="card">
            <div class="stat-card">
              <div class="stat-icon" style="background: #DBEAFE;">
                <span style="color: #1E40AF; font-size: 1.5rem;">👨‍🎓</span>
              </div>
              <div class="stat-info">
                <h3 class="text-sm text-gray-600">Total Estudiantes</h3>
                <p class="text-2xl font-bold">{{ stats.totalEstudiantes }}</p>
              </div>
            </div>
          </div>

          <!-- Asistencias Hoy -->
          <div class="card">
            <div class="stat-card">
              <div class="stat-icon" style="background: #D1FAE5;">
                <span style="color: #065F46; font-size: 1.5rem;">✓</span>
              </div>
              <div class="stat-info">
                <h3 class="text-sm text-gray-600">Asistencias Hoy</h3>
                <p class="text-2xl font-bold">{{ stats.asistenciasHoy }}</p>
              </div>
            </div>
          </div>

          <!-- Tardanzas Hoy -->
          <div class="card">
            <div class="stat-card">
              <div class="stat-icon" style="background: #FEF3C7;">
                <span style="color: #92400E; font-size: 1.5rem;">⏱</span>
              </div>
              <div class="stat-info">
                <h3 class="text-sm text-gray-600">Tardanzas Hoy</h3>
                <p class="text-2xl font-bold">{{ stats.tardanzasHoy }}</p>
              </div>
            </div>
          </div>

          <!-- Faltas Hoy -->
          <div class="card">
            <div class="stat-card">
              <div class="stat-icon" style="background: #FEE2E2;">
                <span style="color: #991B1B; font-size: 1.5rem;">✕</span>
              </div>
              <div class="stat-info">
                <h3 class="text-sm text-gray-600">Faltas Hoy</h3>
                <p class="text-2xl font-bold">{{ stats.faltasHoy }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Últimas Asistencias -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Últimas Asistencias Registradas</h2>
          </div>
          <div class="card-body">
            <div v-if="ultimasAsistencias.length === 0" class="text-center p-4">
              <p class="text-gray-500">No hay asistencias registradas hoy</p>
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Código</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="asistencia in ultimasAsistencias" :key="asistencia.id">
                    <td>{{ asistencia.nombre }}</td>
                    <td>{{ asistencia.codigo }}</td>
                    <td>{{ formatHora(asistencia.hora) }}</td>
                    <td>
                      <span :class="getEstadoBadgeClass(asistencia.estado)">
                        {{ asistencia.estado }}
                      </span>
                    </td>
                    <td>
                      <span class="badge badge-secondary">{{ asistencia.origen }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Accesos rápidos (solo para admin) -->
        <div v-if="isAdmin" class="grid grid-cols-3 mt-5">
          <router-link to="/estudiantes/nuevo" class="quick-action-card card">
            <span class="quick-action-icon">➕</span>
            <h3>Nuevo Estudiante</h3>
          </router-link>

          <router-link to="/asistencias" class="quick-action-card card">
            <span class="quick-action-icon">📋</span>
            <h3>Ver Asistencias</h3>
          </router-link>

          <router-link to="/estudiantes" class="quick-action-card card">
            <span class="quick-action-icon">👥</span>
            <h3>Gestionar Estudiantes</h3>
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/store/authStore'
import { asistenciasService, estudiantesService } from '@/api'
import AppLayout from '@/components/AppLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'

export default {
  name: 'DashboardPage',
  components: {
    AppLayout,
    LoadingSpinner,
    Alert
  },
  setup() {
    const { user, isAdmin } = useAuth()

    const loading = ref(true)
    const error = ref(null)

    const stats = ref({
      totalEstudiantes: 0,
      asistenciasHoy: 0,
      tardanzasHoy: 0,
      faltasHoy: 0
    })

    const ultimasAsistencias = ref([])

    // Obtener fecha actual formateada
    const getCurrentDate = () => {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      return new Date().toLocaleDateString('es-ES', options)
    }

    // Formatear hora
    const formatHora = (hora) => {
      if (!hora) return ''
      return hora.substring(0, 5) // HH:mm
    }

    // Obtener clase CSS para badge de estado
    const getEstadoBadgeClass = (estado) => {
      const classes = {
        'PRESENTE': 'badge badge-success',
        'TARDANZA': 'badge badge-warning',
        'FALTA': 'badge badge-danger',
        'JUSTIFICADA': 'badge badge-info'
      }
      return classes[estado] || 'badge badge-secondary'
    }

    // Cargar datos del dashboard
    const loadDashboardData = async () => {
      try {
        loading.value = true
        error.value = null

        const hoy = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // Obtener total de estudiantes
        const estudiantes = await estudiantesService.getAll()
        stats.value.totalEstudiantes = estudiantes.length

        // Obtener asistencias de hoy
        const asistenciasHoy = await asistenciasService.getAll({
          fechaDesde: hoy,
          fechaHasta: hoy
        })

        // Calcular estadísticas
        stats.value.asistenciasHoy = asistenciasHoy.filter(a => a.estado === 'PRESENTE').length
        stats.value.tardanzasHoy = asistenciasHoy.filter(a => a.estado === 'TARDANZA').length
        stats.value.faltasHoy = asistenciasHoy.filter(a => a.estado === 'FALTA').length

        // Últimas 10 asistencias
        ultimasAsistencias.value = asistenciasHoy.slice(0, 10)

      } catch (err) {
        error.value = 'Error al cargar datos del dashboard'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      user,
      isAdmin,
      loading,
      error,
      stats,
      ultimasAsistencias,
      getCurrentDate,
      formatHora,
      getEstadoBadgeClass
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  /* Estilos específicos del dashboard */
}

.dashboard-header {
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-decoration: none;
  color: var(--gray-900);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.quick-action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.quick-action-card h3 {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}
</style>
