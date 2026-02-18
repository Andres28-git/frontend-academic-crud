<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="modal">
        <!-- Header -->
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button @click="handleClose" class="btn btn-sm btn-secondary">✕</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <slot></slot>
        </div>

        <!-- Footer (opcional) -->
        <div class="modal-footer" v-if="showFooter">
          <slot name="footer">
            <button @click="handleClose" class="btn btn-secondary">
              {{ cancelText }}
            </button>
            <button @click="handleConfirm" class="btn btn-primary">
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Modal'
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleClose() {
      if (this.closeOnOverlay) {
        this.$emit('close')
      }
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>
