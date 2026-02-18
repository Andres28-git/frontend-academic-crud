<template>
  <div v-if="show" :class="['alert', `alert-${type}`]">
    <p>{{ message }}</p>
    <button
      v-if="closeable"
      @click="close"
      class="btn btn-sm"
      style="position: absolute; top: 0.5rem; right: 0.5rem;"
    >
      ✕
    </button>
  </div>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    type: {
      type: String,
      default: 'info', // 'success', 'error', 'warning', 'info'
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    message: {
      type: String,
      required: true
    },
    closeable: {
      type: Boolean,
      default: true
    },
    autoDismiss: {
      type: Number,
      default: 0 // 0 = no auto dismiss, >0 = milliseconds
    }
  },
  data() {
    return {
      show: true
    }
  },
  mounted() {
    if (this.autoDismiss > 0) {
      setTimeout(() => {
        this.close()
      }, this.autoDismiss)
    }
  },
  methods: {
    close() {
      this.show = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.alert {
  position: relative;
}
</style>
