import { reactive, computed } from 'vue'
import { authService } from '@/api'

/**
 * Store de autenticación (estado global)
 * Maneja el usuario actual y el token JWT
 */
const state = reactive({
  user: null,
  token: null,
  loading: false,
  error: null
})

/**
 * Composable de autenticación
 * Proporciona estado y métodos para manejo de autenticación
 */
export function useAuth() {
  // Computed properties
  const isAuthenticated = computed(() => !!state.token && !!state.user)
  const isAdmin = computed(() => state.user?.rol === 'ADMIN')
  const isRepresentante = computed(() => state.user?.rol === 'REPRESENTANTE')
  const isEstudiante = computed(() => state.user?.rol === 'ESTUDIANTE')

  /**
   * Inicializar autenticación desde localStorage
   */
  const initializeAuth = () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      state.token = token
      state.user = JSON.parse(userStr)
    }
  }

  /**
   * Iniciar sesión
   * @param {Object} credentials - {correo, password}
   * @returns {Promise<boolean>} - true si login exitoso
   */
  const login = async (credentials) => {
    try {
      state.loading = true
      state.error = null

      const response = await authService.login(credentials)

      if (response.success) {
        // Guardar token y usuario
        state.token = response.token
        state.user = response.usuario

        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.usuario))

        return true
      } else {
        state.error = response.message || 'Error en el login'
        return false
      }
    } catch (error) {
      state.error = error.response?.data?.message || 'Error de conexión'
      return false
    } finally {
      state.loading = false
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - {nombre, correo, password, rol}
   * @returns {Promise<boolean>}
   */
  const register = async (userData) => {
    try {
      state.loading = true
      state.error = null

      const response = await authService.register(userData)

      if (response.success) {
        // Auto-login después del registro
        state.token = response.token
        state.user = response.usuario

        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.usuario))

        return true
      } else {
        state.error = response.message || 'Error en el registro'
        return false
      }
    } catch (error) {
      state.error = error.response?.data?.message || 'Error de conexión'
      return false
    } finally {
      state.loading = false
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = () => {
    state.user = null
    state.token = null
    state.error = null
    authService.logout()
  }

  /**
   * Actualizar datos del usuario en el store
   * @param {Object} userData - Datos actualizados del usuario
   */
  const updateUser = (userData) => {
    state.user = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(state.user))
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} rol - Rol a verificar
   * @returns {boolean}
   */
  const hasRole = (rol) => {
    return state.user?.rol === rol
  }

  /**
   * Obtener datos del usuario actual desde la API
   */
  const fetchCurrentUser = async () => {
    try {
      const userData = await authService.getCurrentUser()
      updateUser(userData)
      return true
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      logout()
      return false
    }
  }

  return {
    // Estado
    user: computed(() => state.user),
    token: computed(() => state.token),
    loading: computed(() => state.loading),
    error: computed(() => state.error),

    // Computed
    isAuthenticated,
    isAdmin,
    isRepresentante,
    isEstudiante,

    // Métodos
    initializeAuth,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    fetchCurrentUser
  }
}
