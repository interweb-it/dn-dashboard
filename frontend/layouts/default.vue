<template>
  <v-layout>
    <!-- <v-app> -->
      <v-main>
        <SystemBar />
        <slot />
      </v-main>
    <!-- </v-app> -->
  </v-layout>
</template>

<script lang="ts">
import SystemBar from '../components/SystemBar.vue';

export default defineComponent({
  name: 'App',
  components: {
    SystemBar
  }
})
</script>
