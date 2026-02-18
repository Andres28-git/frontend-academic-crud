import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from './store/authStore'
import './assets/styles/main.css'

const app = createApp(App)

// Inicializar autenticación antes de montar la app
const { initializeAuth } = useAuth()
initializeAuth()

app.use(router)
app.mount('#app')
