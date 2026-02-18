<template>
  <AppLayout>
    <div class="estudiante-detail-page">
      <!-- Cargando -->
      <LoadingSpinner v-if="loading" message="Cargando detalles del estudiante..." />

      <!-- Contenido -->
      <div v-else>
        <!-- Header con botones -->
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold">Detalles del Estudiante</h1>
          <div class="flex gap-2">
            <router-link
              :to="`/estudiantes/${estudiante.id}/editar`"
              class="btn btn-primary"
            >
              ✏️ Editar
            </router-link>
            <router-link to="/estudiantes" class="btn btn-secondary">
              ← Volver
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-3">
          <!-- Columna izquierda: Información básica -->
          <div class="col-span-2">
            <div class="card mb-4">
              <div class="card-header">
                <h2 class="card-title">Información Básica</h2>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item">
                    <label>ID:</label>
                    <span>{{ estudiante.id }}</span>
                  </div>
                  <div class="info-item">
                    <label>Código:</label>
                    <span><strong>{{ estudiante.codigo }}</strong></span>
                  </div>
                  <div class="info-item">
                    <label>Nombre:</label>
                    <span>{{ estudiante.nombre }}</span>
                  </div>
                  <div class="info-item">
                    <label>Estado:</label>
                    <span :class="estudiante.activo ? 'badge badge-success' : 'badge badge-secondary'">
                      {{ estudiante.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <div class="info-item">
                    <label>Fecha de Registro:</label>
                    <span>{{ formatFecha(estudiante.createdAt) }}</span>
                  </div>
                  <div class="info-item">
                    <label>QR Token:</label>
                    <code class="text-sm">{{ estudiante.qrToken }}</code>
                  </div>
                </div>
              </div>
            </div>

            <!-- Últimas Asistencias -->
            <div class="card">
              <div class="card-header">
                <h2 class="card-title">Últimas Asistencias</h2>
              </div>
              <div class="card-body">
                <div v-if="loadingAsistencias" class="text-center p-4">
                  <LoadingSpinner size="small" />
                </div>
                <div v-else-if="asistencias.length === 0" class="text-center p-4">
                  <p class="text-gray-500">No hay asistencias registradas</p>
                </div>
                <div v-else class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Origen</th>
                        <th>Observación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="asistencia in asistencias" :key="asistencia.id">
                        <td>{{ formatFecha(asistencia.fecha) }}</td>
                        <td>{{ formatHora(asistencia.hora) }}</td>
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

          <!-- Columna derecha: Código QR -->
          <div>
            <div class="card">
              <div class="card-header">
                <h2 class="card-title text-center">Código QR</h2>
              </div>
              <div class="card-body text-center">
                <div class="qr-container">
                  <div id="qr-code" ref="qrCodeElement"></div>
                  <p class="text-sm text-gray-600 mt-3">
                    Escanea este código para registrar asistencia
                  </p>
                  <button @click="descargarQR" class="btn btn-primary mt-3" style="width: 100%;">
                    📥 Descargar QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { estudiantesService, asistenciasService } from '@/api'
import AppLayout from '@/components/AppLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'EstudianteDetailPage',
  components: {
    AppLayout,
    LoadingSpinner
  },
  setup() {
    const route = useRoute()

    const loading = ref(true)
    const loadingAsistencias = ref(true)
    const estudiante = ref({})
    const asistencias = ref([])
    const qrCodeElement = ref(null)

    // Formatear fecha
    const formatFecha = (fecha) => {
      if (!fecha) return ''
      return new Date(fecha).toLocaleDateString('es-ES')
    }

    // Formatear hora
    const formatHora = (hora) => {
      if (!hora) return ''
      return hora.substring(0, 5)
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

    // Cargar estudiante
    const cargarEstudiante = async () => {
      try {
        loading.value = true
        estudiante.value = await estudiantesService.getById(route.params.id)
        // Generar QR después de cargar
        generarQR()
      } catch (error) {
        console.error('Error al cargar estudiante:', error)
      } finally {
        loading.value = false
      }
    }

    // Cargar asistencias
    const cargarAsistencias = async () => {
      try {
        loadingAsistencias.value = true
        const todasAsistencias = await asistenciasService.getAll({
          estudianteId: route.params.id
        })
        // Últimas 10 asistencias
        asistencias.value = todasAsistencias.slice(0, 10)
      } catch (error) {
        console.error('Error al cargar asistencias:', error)
      } finally {
        loadingAsistencias.value = false
      }
    }

    // Generar código QR
    const generarQR = () => {
      // Usar API de QRCode.js simple (sin dependencias externas)
      // Alternativa: usar una librería como qrcode.js

      // Solución simple: generar QR usando API pública
      const qrData = estudiante.value.qrToken
      const qrSize = 200
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}`

      // Crear imagen
      const img = document.createElement('img')
      img.src = qrCodeUrl
      img.alt = 'QR Code'
      img.style.maxWidth = '100%'

      // Limpiar contenedor y agregar imagen
      if (qrCodeElement.value) {
        qrCodeElement.value.innerHTML = ''
        qrCodeElement.value.appendChild(img)
      }
    }

    // Descargar QR
    const descargarQR = () => {
      const qrData = estudiante.value.qrToken
      const qrSize = 400
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}`

      // Crear link de descarga
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `QR-${estudiante.value.codigo}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    onMounted(() => {
      cargarEstudiante()
      cargarAsistencias()
    })

    return {
      loading,
      loadingAsistencias,
      estudiante,
      asistencias,
      qrCodeElement,
      formatFecha,
      formatHora,
      getEstadoBadgeClass,
      descargarQR
    }
  }
}
</script>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item code {
  background: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  word-break: break-all;
}

.qr-container {
  padding: 1rem;
}

#qr-code {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
