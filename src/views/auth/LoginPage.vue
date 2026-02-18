<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card card">
        <!-- Header -->
        <div class="login-header">
          <div class="login-logo">
            <span class="brand-icon">✓</span>
          </div>
          <h1 class="login-title">PuntualCheck</h1>
          <p class="login-subtitle">Sistema de Control de Asistencias</p>
        </div>

        <!-- Alert de error -->
        <Alert
          v-if="error"
          type="error"
          :message="error"
          @close="error = null"
        />

        <!-- Formulario de Login -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- Correo -->
          <div class="form-group">
            <label for="correo" class="form-label">Correo Electrónico</label>
            <input
              id="correo"
              v-model="form.correo"
              type="email"
              class="form-input"
              :class="{ error: errors.correo }"
              placeholder="tu@correo.com"
              required
              autocomplete="email"
            />
            <span v-if="errors.correo" class="form-error">{{ errors.correo }}</span>
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <!-- Botón de submit -->
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            style="width: 100%;"
            :disabled="loading"
          >
            <template v-if="loading">
              <div class="loader loader-sm" style="border-color: white transparent white transparent;"></div>
              Iniciando sesión...
            </template>
            <template v-else>
              Iniciar Sesión
            </template>
          </button>
        </form>

        <!-- Información adicional -->
        <div class="login-footer">
          <p class="text-sm text-center" style="color: var(--gray-500);">
            <strong>Usuarios de prueba:</strong><br>
            Admin: admin@puntualcheck.com / 123456<br>
            Representante: rep@puntualcheck.com / 123456
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/store/authStore'
import Alert from '@/components/Alert.vue'

export default {
  name: 'LoginPage',
  components: {
    Alert
  },
  setup() {
    const router = useRouter()
    const { login, loading } = useAuth()

    const form = ref({
      correo: '',
      password: ''
    })

    const errors = ref({})
    const error = ref(null)

    // Validar formulario
    const validateForm = () => {
      errors.value = {}
      let isValid = true

      if (!form.value.correo) {
        errors.value.correo = 'El correo es obligatorio'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(form.value.correo)) {
        errors.value.correo = 'El correo no es válido'
        isValid = false
      }

      if (!form.value.password) {
        errors.value.password = 'La contraseña es obligatoria'
        isValid = false
      } else if (form.value.password.length < 6) {
        errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
      }

      return isValid
    }

    // Manejar submit del formulario
    const handleSubmit = async () => {
      error.value = null

      if (!validateForm()) {
        return
      }

      try {
        const success = await login({
          correo: form.value.correo,
          password: form.value.password
        })

        if (success) {
          // Redirigir al dashboard
          router.push('/dashboard')
        } else {
          error.value = 'Credenciales incorrectas o usuario inactivo'
        }
      } catch (err) {
        error.value = err.message || 'Error al iniciar sesión'
      }
    }

    return {
      form,
      errors,
      error,
      loading,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  margin-bottom: 1rem;
}

.brand-icon {
  background: var(--primary-color);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.login-footer {
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>
