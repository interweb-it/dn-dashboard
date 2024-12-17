<template>
  <v-system-bar>
    <span>d e c e n t r a l i s e d &nbsp; n o d e s</span>
    <v-spacer></v-spacer>
    <!-- <span class="ms-2">{{apiConnected}}</span> -->
    <v-icon :icon="`mdi-signal-cellular-${apiConnected ? '3' : '1'}`" :color="`${apiConnected ? 'green' : 'grey'}`" class="ms-2"></v-icon>
    <!-- <span class="ms-2">3:13PM</span> -->
  </v-system-bar>
</template>

<script lang="ts">
export default defineComponent({
  name: 'SystemBar',
  setup() {
    const nodeStore = useNodeStore();
    const substrateStore = useSubstrateStore();
    const apiConnected = computed(() => substrateStore.apiConnected);

    return {
      apiConnected,
    }
  }
})
</script>
