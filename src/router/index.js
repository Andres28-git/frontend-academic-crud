import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/store/authStore'

// Importar vistas (lazy loading)
const LoginPage = () => import('@/views/auth/LoginPage.vue')
const DashboardPage = () => import('@/views/dashboard/DashboardPage.vue')
const EstudiantesListPage = () => import('@/views/estudiantes/EstudiantesListPage.vue')
const EstudianteDetailPage = () => import('@/views/estudiantes/EstudianteDetailPage.vue')
const EstudianteFormPage = () => import('@/views/estudiantes/EstudianteFormPage.vue')
const AsistenciasListPage = () => import('@/views/asistencias/AsistenciasListPage.vue')
const UsuariosListPage = () => import('@/views/usuarios/UsuariosListPage.vue')

// Definir rutas
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/estudiantes',
    name: 'EstudiantesList',
    component: EstudiantesListPage,
    meta: { requiresAuth: true, requiresRole: 'ADMIN' }
  },
  {
    path: '/estudiantes/nuevo',
    name: 'EstudianteCreate',
    component: EstudianteFormPage,
    meta: { requiresAuth: true, requiresRole: 'ADMIN' }
  },
  {
    path: '/estudiantes/:id',
    name: 'EstudianteDetail',
    component: EstudianteDetailPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/estudiantes/:id/editar',
    name: 'EstudianteEdit',
    component: EstudianteFormPage,
    meta: { requiresAuth: true, requiresRole: 'ADMIN' }
  },
  {
    path: '/asistencias',
    name: 'AsistenciasList',
    component: AsistenciasListPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios',
    name: 'UsuariosList',
    component: UsuariosListPage,
    meta: { requiresAuth: true, requiresRole: 'ADMIN' }
  }
]

// Crear router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const { isAuthenticated, user } = useAuth()

  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!isAuthenticated.value) {
      // No autenticado -> redirigir a login
      next('/login')
      return
    }

    // Si la ruta requiere un rol específico
    if (to.meta.requiresRole) {
      if (user.value?.rol !== to.meta.requiresRole) {
        // No tiene el rol necesario -> redirigir a dashboard
        console.warn(`Acceso denegado. Se requiere rol: ${to.meta.requiresRole}`)
        next('/dashboard')
        return
      }
    }
  }

  // Si ya está autenticado e intenta ir a login, redirigir a dashboard
  if (to.path === '/login' && isAuthenticated.value) {
    next('/dashboard')
    return
  }

  next()
})

export default router
