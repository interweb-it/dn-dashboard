<template>
  <v-container>
    <v-toolbar>
      <v-btn icon :to="`/${chainId}/telemetry`">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Node: {{ stash }}</v-toolbar-title>
    </v-toolbar>
  </v-container>
</template>

<script lang="ts">
// import { defineComponent } from '@nuxtjs/composition-api'
import { useNodeStore } from '@/stores/nodeStore'

export default defineComponent({
  setup() {
    const route = useRoute()
    const chainId = ref(route.params.chainId)
    const stash = ref(route.params.stash)
    const store = useNodeStore()
    return {
      chainId,
      stash
    }
  }
})
</script>
