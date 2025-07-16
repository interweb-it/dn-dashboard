<template>
  <v-system-bar>
    <span>d e c e n t r a l i s e d &nbsp; n o d e s</span>
    <v-spacer></v-spacer>
    <v-icon :icon="`mdi-signal-cellular-${apiConnected ? '3' : '1'}`" :color="`${apiConnected ? 'green' : 'grey'}`" class="ms-2"></v-icon>
  </v-system-bar>
</template>

<script lang="ts">
export default defineComponent({
  name: 'SystemBar',
  setup() {
    const substrateStore = useSubstrateStore();
    const apiConnected = computed(() => substrateStore.apiConnected);

    watch(() => substrateStore.apiConnected, (newVal) => {
      console.debug('SystemBar.vue: apiConnected', newVal);
    });

    onMounted(() => {
      console.debug('SystemBar.vue: onMounted()');
    });

    return {
      apiConnected,
    }
  }
})
</script>
