<template>
  <div class="app-layout">
    <Navbar />
    <main class="main-content">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    <footer class="app-footer">
      <div class="container">
        <p class="text-center text-sm" style="color: var(--gray-500);">
          &copy; {{ currentYear }} PuntualCheck - Sistema de Asistencias
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from './Navbar.vue'

export default {
  name: 'AppLayout',
  components: {
    Navbar
  },
  data() {
    return {
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.app-footer {
  background: white;
  border-top: 1px solid var(--gray-200);
  padding: 1.5rem 0;
  margin-top: 3rem;
}
</style>
