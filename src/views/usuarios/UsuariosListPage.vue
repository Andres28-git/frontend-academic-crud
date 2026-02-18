<template>
  <AppLayout>
    <div class="usuarios-list-page">
      <h1 class="text-3xl font-bold mb-4">Usuarios</h1>

      <!-- Cargando -->
      <LoadingSpinner v-if="loading" message="Cargando usuarios..." />

      <!-- Tabla de usuarios -->
      <div v-else class="card">
        <div class="card-body">
          <div v-if="usuarios.length === 0" class="text-center p-4">
            <p class="text-gray-500">No hay usuarios registrados</p>
          </div>

          <div v-else class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuarios" :key="usuario.id">
                  <td>{{ usuario.id }}</td>
                  <td><strong>{{ usuario.nombre }}</strong></td>
                  <td>{{ usuario.correo }}</td>
                  <td>
                    <span :class="getRolBadgeClass(usuario.rol)">
                      {{ usuario.rol }}
                    </span>
                  </td>
                  <td>
                    <span :class="usuario.activo ? 'badge badge-success' : 'badge badge-secondary'">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>{{ formatFecha(usuario.createdAt) }}</td>
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
import { usuariosService } from '@/api'
import AppLayout from '@/components/AppLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

export default {
  name: 'UsuariosListPage',
  components: {
    AppLayout,
    LoadingSpinner
  },
  setup() {
    const loading = ref(true)
    const usuarios = ref([])

    const formatFecha = (fecha) => {
      if (!fecha) return ''
      return new Date(fecha).toLocaleDateString('es-ES')
    }

    const getRolBadgeClass = (rol) => {
      const classes = {
        'ADMIN': 'badge badge-danger',
        'REPRESENTANTE': 'badge badge-info',
        'ESTUDIANTE': 'badge badge-success'
      }
      return classes[rol] || 'badge badge-secondary'
    }

    const cargarUsuarios = async () => {
      try {
        loading.value = true
        usuarios.value = await usuariosService.getAll()
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      cargarUsuarios()
    })

    return {
      loading,
      usuarios,
      formatFecha,
      getRolBadgeClass
    }
  }
}
</script>
