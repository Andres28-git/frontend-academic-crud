import axios from 'axios'

// URL base de la API (puede venir de variable de entorno)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://puntualcheck-production.up.railway.app'

// Crear instancia de Axios
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token JWT a todas las peticiones
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores globales
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      switch (error.response.status) {
        case 401:
          // Token inválido o expirado - redirigir a login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          console.error('No tienes permisos para realizar esta acción')
          break
        case 404:
          console.error('Recurso no encontrado')
          break
        case 500:
          console.error('Error del servidor. Intenta más tarde')
          break
        default:
          console.error('Error en la petición:', error.response.data)
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No se pudo conectar con el servidor')
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default axiosClient
