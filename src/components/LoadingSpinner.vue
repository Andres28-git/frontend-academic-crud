<template>
  <div class="loading-container">
    <div :class="['loader', size === 'small' ? 'loader-sm' : '']"></div>
    <p v-if="message" class="mt-3 text-center">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'normal', // 'small' o 'normal'
      validator: (value) => ['small', 'normal'].includes(value)
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>
