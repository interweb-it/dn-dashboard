<template>
  <v-container>
    <v-toolbar color="background" >
      <v-icon><v-img src="/image/logo-black.png" height="32" width="32"></v-img></v-icon>
      <v-icon size="small"><v-img :src="`/image/${chainId}-logo.svg`" height="22" width="22" style="border-radius: 20%;"></v-img></v-icon>
      <v-toolbar-title>Cohort</v-toolbar-title>
      <v-btn>
        <NuxtLink :to="`/${chainId}/cohort/1`">Cohort 1</NuxtLink>
      </v-btn>
    </v-toolbar>
  </v-container>
</template>

<script lang="ts">

export default defineComponent({
  name: 'ChainHome',
  setup() {
    const route = useRoute()
    const chainId = ref(route.params.chainId.toString())

    const substrateStore = useSubstrateStore()
    substrateStore.setChainId(chainId.value)

    const { $substrate } = useNuxtApp();

    onMounted(() => {
      console.debug(`Connecting to chain ${chainId.value}`);
      $substrate.connect(chainId.value);
    });

    return {
      chainId
    }
  }
})
</script>