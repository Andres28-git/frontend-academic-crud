<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo y título -->
        <div class="navbar-brand">
          <router-link to="/dashboard" class="brand-link">
            <span class="brand-icon">✓</span>
            <span class="brand-text">PuntualCheck</span>
          </router-link>
        </div>

        <!-- Enlaces de navegación -->
        <div class="navbar-links" v-if="isAuthenticated">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>

          <!-- Enlaces solo para ADMIN -->
          <template v-if="isAdmin">
            <router-link to="/estudiantes" class="nav-link">Estudiantes</router-link>
            <router-link to="/asistencias" class="nav-link">Asistencias</router-link>
            <router-link to="/usuarios" class="nav-link">Usuarios</router-link>
          </template>

          <!-- Enlaces para REPRESENTANTE -->
          <template v-else-if="isRepresentante">
            <router-link to="/mis-hijos" class="nav-link">Mis Hijos</router-link>
            <router-link to="/mis-notificaciones" class="nav-link">Notificaciones</router-link>
          </template>

          <!-- Enlaces para ESTUDIANTE -->
          <template v-else-if="isEstudiante">
            <router-link to="/mis-asistencias" class="nav-link">Mis Asistencias</router-link>
            <router-link to="/mi-qr" class="nav-link">Mi QR</router-link>
          </template>
        </div>

        <!-- Usuario y logout -->
        <div class="navbar-user" v-if="isAuthenticated">
          <span class="user-info">
            <strong>{{ user?.nombre }}</strong>
            <span class="badge badge-info">{{ user?.rol }}</span>
          </span>
          <button @click="handleLogout" class="btn btn-secondary btn-sm">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuth } from '@/store/authStore'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const { user, isAuthenticated, isAdmin, isRepresentante, isEstudiante, logout } = useAuth()

    const handleLogout = () => {
      logout()
      router.push('/login')
    }

    return {
      user,
      isAuthenticated,
      isAdmin,
      isRepresentante,
      isEstudiante,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: var(--shadow);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-icon {
  background: var(--primary-color);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.brand-text {
  color: var(--gray-900);
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: var(--gray-600);
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .navbar-content {
    flex-direction: column;
    gap: 1rem;
  }

  .navbar-links {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .navbar-user {
    flex-direction: column;
    width: 100%;
  }
}
</style>
